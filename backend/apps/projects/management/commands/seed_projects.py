from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.accounts.models import User
from apps.domains.models import CommunityDomain
from apps.projects.models import Project


class Command(BaseCommand):
    help = "Seeds initial showcase developer projects into PostgreSQL."

    def handle(self, *args, **options):
        # Ensure a demo contributor user exists
        user, _ = User.objects.get_or_create(
            email="showcase_dev@navapai.org",
            defaults={
                "username": "navapai_architect",
                "first_name": "Navapai",
                "last_name": "Engineer",
            },
        )
        if not user.has_usable_password():
            user.set_password("NavapaiPass2026!")
            user.save()

        sample_projects = [
            {
                "title": "Cloud-Native Microservices Mesh",
                "tagline": "Multi-region Kubernetes deployment with automated Istio traffic management and Prometheus metrics.",
                "description": "Enterprise-grade microservices mesh engineered on AWS EKS and Docker with distributed tracing and zero-downtime canary rollouts.",
                "domain_slug": "devops",
                "primary_language": "Go",
                "technologies": ["Kubernetes", "Docker", "AWS", "Go", "Prometheus", "Istio"],
                "github_url": "https://github.com/kubernetes/kubernetes",
                "live_demo_url": "https://mesh.navapai.org",
                "github_stars_count": 105400,
                "github_forks_count": 38900,
                "status": "COMPLETED",
                "is_featured": True,
                "is_showcase": True,
            },
            {
                "title": "Full-Stack Django & React SaaS Platform",
                "tagline": "Enterprise-ready multi-tenant application featuring SimpleJWT authentication and PostgreSQL pg_trgm similarity.",
                "description": "Production-tested developer learning platform combining automated curriculum tracking, smart domain merging, and real-time GitHub sync.",
                "domain_slug": "django",
                "primary_language": "Python",
                "technologies": ["Django", "React", "PostgreSQL", "Vite", "DRF", "Docker"],
                "github_url": "https://github.com/django/django",
                "live_demo_url": "https://navapai.org",
                "github_stars_count": 78200,
                "github_forks_count": 31400,
                "status": "COMPLETED",
                "is_featured": True,
                "is_showcase": True,
            },
            {
                "title": "Real-time AI Document Summarizer",
                "tagline": "FastAPI and PyTorch embedding pipeline for automated research paper analysis and keyword clustering.",
                "description": "Deep learning research pipeline that parses multi-page PDFs, computes vector embeddings, and generates structured executive summaries.",
                "domain_slug": "python",
                "primary_language": "Python",
                "technologies": ["Python", "PyTorch", "FastAPI", "React", "Docker", "PostgreSQL"],
                "github_url": "https://github.com/tiangolo/fastapi",
                "live_demo_url": "https://ai.navapai.org",
                "github_stars_count": 74500,
                "github_forks_count": 6100,
                "status": "IN_PROGRESS",
                "is_featured": True,
                "is_showcase": True,
            },
            {
                "title": "Zero-Trust AWS Security Architecture",
                "tagline": "Terraform and AWS IAM policy engine enforcing strict zero-trust network boundaries and secret rotation.",
                "description": "Terraform module library deploying multi-tier VPC isolation, automated AWS KMS key rotation, GuardDuty alerting, and IAM least-privilege verification.",
                "domain_slug": "aws",
                "primary_language": "HCL",
                "technologies": ["AWS", "Terraform", "Security", "Python", "Docker"],
                "github_url": "https://github.com/hashicorp/terraform",
                "live_demo_url": "https://aws.amazon.com",
                "github_stars_count": 42100,
                "github_forks_count": 9200,
                "status": "COMPLETED",
                "is_featured": True,
                "is_showcase": True,
            },
        ]

        created_count = 0
        for p_data in sample_projects:
            domain = CommunityDomain.objects.filter(slug=p_data.pop("domain_slug")).first()
            p, created = Project.objects.get_or_create(
                slug=slugify(f"{p_data['title']}-{user.username}")[:230],
                defaults={
                    "user": user,
                    "community_domain": domain,
                    **p_data,
                },
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {created_count} showcase projects. (Total in DB: {Project.objects.count()})"
            )
        )
