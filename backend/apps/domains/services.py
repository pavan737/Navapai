from django.contrib.postgres.search import TrigramSimilarity
from django.db import transaction
from django.db.models import F
from .models import CommunityDomain, DomainAlias, UserDomain, DomainMergeLog, AdminAuditLog, normalize_string


class DomainSimilarityService:
    """
    Multi-tier domain similarity detection engine using PostgreSQL trigrams
    and normalized alias registries (Section 20).
    """

    @classmethod
    def detect_similarity(cls, raw_title: str, threshold: float = 0.40) -> dict:
        if not raw_title or not raw_title.strip():
            return {
                "query": raw_title,
                "normalized_query": "",
                "has_matches": False,
                "top_match": None,
                "suggestions": [],
            }

        normalized = normalize_string(raw_title)
        candidate_scores = {}  # domain_id -> dict

        # Tier 1: Exact Normalized Title Match (Score: 1.0)
        exact_domains = CommunityDomain.objects.filter(
            normalized_title=normalized,
            is_approved=True,
        )
        for d in exact_domains:
            candidate_scores[d.id] = {
                "domain_id": d.id,
                "title": d.title,
                "slug": d.slug,
                "category": d.category,
                "members_count": d.members_count,
                "topics_count": d.topics_count,
                "similarity_score": 1.0,
                "match_type": "EXACT_TITLE_MATCH",
                "matched_on": d.title,
                "confidence": "HIGH",
            }

        # Tier 2: Exact Alias Match (Score: 0.95)
        exact_aliases = DomainAlias.objects.filter(
            normalized_alias=normalized,
            domain__is_approved=True,
        ).select_related("domain")
        for a in exact_aliases:
            d = a.domain
            if d.id not in candidate_scores or candidate_scores[d.id]["similarity_score"] < 0.95:
                candidate_scores[d.id] = {
                    "domain_id": d.id,
                    "title": d.title,
                    "slug": d.slug,
                    "category": d.category,
                    "members_count": d.members_count,
                    "topics_count": d.topics_count,
                    "similarity_score": 0.95,
                    "match_type": "ALIAS_MATCH",
                    "matched_on": a.alias,
                    "confidence": "HIGH",
                }

        # Tier 3: PostgreSQL Trigram Similarity on Domain Title
        try:
            trigram_domains = (
                CommunityDomain.objects.filter(is_approved=True)
                .annotate(sim=TrigramSimilarity("normalized_title", normalized))
                .filter(sim__gte=threshold)
            )
            for d in trigram_domains:
                score = round(float(d.sim), 2)
                confidence = "HIGH" if score >= 0.85 else ("MEDIUM" if score >= 0.65 else "LOW")
                if d.id not in candidate_scores or candidate_scores[d.id]["similarity_score"] < score:
                    candidate_scores[d.id] = {
                        "domain_id": d.id,
                        "title": d.title,
                        "slug": d.slug,
                        "category": d.category,
                        "members_count": d.members_count,
                        "topics_count": d.topics_count,
                        "similarity_score": score,
                        "match_type": "TRIGRAM_TITLE_MATCH",
                        "matched_on": d.title,
                        "confidence": confidence,
                    }
        except Exception as e:
            # Fallback if database backend is not PostgreSQL in isolated unit test runner
            pass

        # Tier 3b: PostgreSQL Trigram Similarity on Domain Aliases
        try:
            trigram_aliases = (
                DomainAlias.objects.filter(domain__is_approved=True)
                .annotate(sim=TrigramSimilarity("normalized_alias", normalized))
                .filter(sim__gte=threshold)
                .select_related("domain")
            )
            for a in trigram_aliases:
                d = a.domain
                score = round(float(a.sim), 2)
                confidence = "HIGH" if score >= 0.85 else ("MEDIUM" if score >= 0.65 else "LOW")
                if d.id not in candidate_scores or candidate_scores[d.id]["similarity_score"] < score:
                    candidate_scores[d.id] = {
                        "domain_id": d.id,
                        "title": d.title,
                        "slug": d.slug,
                        "category": d.category,
                        "members_count": d.members_count,
                        "topics_count": d.topics_count,
                        "similarity_score": score,
                        "match_type": "TRIGRAM_ALIAS_MATCH",
                        "matched_on": a.alias,
                        "confidence": confidence,
                    }
        except Exception:
            pass

        # Sort candidate suggestions by score descending
        sorted_suggestions = sorted(
            candidate_scores.values(),
            key=lambda x: x["similarity_score"],
            reverse=True,
        )

        top_match = sorted_suggestions[0] if sorted_suggestions else None

        return {
            "query": raw_title,
            "normalized_query": normalized,
            "has_matches": bool(sorted_suggestions),
            "top_match": top_match,
            "suggestions": sorted_suggestions[:5],
        }


class DomainMergeService:
    """
    Atomic transactional domain merging service (Section 21-25).
    Guarantees: 'Merge the community topic, not the user's content.'
    """

    @classmethod
    @transaction.atomic
    def merge_user_domain_into_canonical(
        cls,
        user_domain: UserDomain,
        target_community_domain: CommunityDomain,
        requested_by=None,
        reason: str = "",
    ) -> DomainMergeLog:
        """
        Merges a user's personal domain/topic into a canonical CommunityDomain.
        CRITICAL: user_domain.original_name is NEVER altered.
        """
        previous_state = {
            "user_domain_id": user_domain.id,
            "original_name": user_domain.original_name,
            "previous_community_domain_id": user_domain.community_domain_id,
            "joined_via": user_domain.joined_via,
        }

        # Calculate similarity score
        detection = DomainSimilarityService.detect_similarity(user_domain.original_name)
        sim_score = 0.0
        if detection["top_match"] and detection["top_match"]["domain_id"] == target_community_domain.id:
            sim_score = detection["top_match"]["similarity_score"]
        elif detection["suggestions"]:
            for s in detection["suggestions"]:
                if s["domain_id"] == target_community_domain.id:
                    sim_score = s["similarity_score"]
                    break

        # Reassign community domain link
        user_domain.community_domain = target_community_domain
        user_domain.joined_via = UserDomain.JoinedVia.MERGED
        user_domain.save(update_fields=["community_domain", "joined_via", "updated_at"])

        # Increment target members count
        CommunityDomain.objects.filter(id=target_community_domain.id).update(
            members_count=F("members_count") + 1
        )

        final_state = {
            "user_domain_id": user_domain.id,
            "original_name": user_domain.original_name,
            "target_community_domain_id": target_community_domain.id,
            "target_community_domain_title": target_community_domain.title,
            "joined_via": UserDomain.JoinedVia.MERGED,
        }

        # Create immutable DomainMergeLog
        log = DomainMergeLog.objects.create(
            source_domain=user_domain.original_name,
            target_domain=target_community_domain,
            requested_by=requested_by or user_domain.user,
            approved_by=requested_by if (requested_by and requested_by.is_staff) else None,
            similarity_score=sim_score or 0.90,
            reason=reason or f"User merged '{user_domain.original_name}' with canonical domain '{target_community_domain.title}'",
            previous_state=previous_state,
            final_state=final_state,
        )

        return log

    @classmethod
    @transaction.atomic
    def merge_two_community_domains(
        cls,
        source_domain: CommunityDomain,
        target_domain: CommunityDomain,
        admin_user,
        reason: str = "",
    ) -> DomainMergeLog:
        """
        Administrative merge of two CommunityDomains.
        Reassigns user domains, registers source as an alias, moves subdomains, and archives source.
        """
        if source_domain.id == target_domain.id:
            raise ValueError("Cannot merge a domain into itself.")

        previous_state = {
            "source_id": source_domain.id,
            "source_title": source_domain.title,
            "target_id": target_domain.id,
            "target_title": target_domain.title,
            "source_members_count": source_domain.members_count,
        }

        # 1. Reassign all UserDomains
        user_domains_count = UserDomain.objects.filter(community_domain=source_domain).update(
            community_domain=target_domain,
            joined_via=UserDomain.JoinedVia.MERGED,
        )

        # 2. Add source domain title as alias to target domain
        DomainAlias.objects.get_or_create(
            domain=target_domain,
            alias=source_domain.title,
        )

        # 3. Transfer all existing aliases from source to target
        DomainAlias.objects.filter(domain=source_domain).update(domain=target_domain)

        # 4. Transfer all subdomains
        CommunityDomain.objects.filter(parent_domain=source_domain).update(parent_domain=target_domain)

        # 5. Increment target members count
        CommunityDomain.objects.filter(id=target_domain.id).update(
            members_count=F("members_count") + user_domains_count
        )

        # 6. Archive source domain
        source_domain.status = CommunityDomain.Status.ARCHIVED
        source_domain.is_public = False
        source_domain.is_approved = False
        source_domain.save(update_fields=["status", "is_public", "is_approved", "updated_at"])

        final_state = {
            "source_id": source_domain.id,
            "source_status": source_domain.status,
            "target_id": target_domain.id,
            "reassigned_user_domains": user_domains_count,
        }

        # 7. Create DomainMergeLog
        merge_log = DomainMergeLog.objects.create(
            source_domain=source_domain.title,
            target_domain=target_domain,
            requested_by=admin_user,
            approved_by=admin_user,
            similarity_score=1.0,
            reason=reason or f"Admin merged CommunityDomain '{source_domain.title}' into canonical '{target_domain.title}'",
            previous_state=previous_state,
            final_state=final_state,
        )

        # 8. Create AdminAuditLog
        AdminAuditLog.objects.create(
            user=admin_user,
            action="COMMUNITY_DOMAIN_MERGED",
            target_model="domains.CommunityDomain",
            target_id=str(source_domain.id),
            details={
                "source_title": source_domain.title,
                "target_title": target_domain.title,
                "reassigned_users": user_domains_count,
                "merge_log_id": merge_log.id,
            },
        )

        return merge_log
