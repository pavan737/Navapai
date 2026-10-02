from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.domains.models import CommunityDomain, DomainAlias, CurriculumTopic, TopicMilestone


class Command(BaseCommand):
    help = "Seeds initial canonical core learning domains, aliases, and curriculum topics into PostgreSQL."

    def handle(self, *args, **options):
        core_domains = [
            {
                "title": "Python",
                "category": "Programming & Languages",
                "description": "General-purpose, versatile language powering web backends, data science, machine learning, and enterprise automation.",
                "icon_name": "Terminal",
                "is_featured": True,
                "members_count": 340,
                "topics_count": 28,
                "aliases": ["Python Programming", "Python Development", "Learn Python", "Python3", "Py"],
                "topics": [
                    {
                        "title": "Python Architecture & Runtime Internals",
                        "difficulty": "BEGINNER",
                        "estimated_hours": 4,
                        "order": 1,
                        "description": "Execution model, bytecode compilation, GIL concepts, and memory management.",
                        "milestones": ["CPython Execution Cycle", "Memory Allocation & Garbage Collection", "Virtual Environments & Pip/Poetry"],
                    },
                    {
                        "title": "Advanced Data Structures & OOP Patterns",
                        "difficulty": "INTERMEDIATE",
                        "estimated_hours": 6,
                        "order": 2,
                        "description": "Dunder methods, dataclasses, generators, decorators, and meta-programming.",
                        "milestones": ["Custom Iterators & Generators", "Class Decorators & Metaclasses", "Type Hinting & Pydantic"],
                    },
                    {
                        "title": "Modern Concurrency: AsyncIO & ThreadPools",
                        "difficulty": "ADVANCED",
                        "estimated_hours": 8,
                        "order": 3,
                        "description": "Event loops, coroutines, TaskGroups, and asynchronous HTTP client/server programming.",
                        "milestones": ["AsyncIO Event Loop Mastery", "TaskGroup Exception Handling", "High-Throughput Concurrent Pipelines"],
                    },
                    {
                        "title": "High-Performance Profiling & Testing",
                        "difficulty": "EXPERT",
                        "estimated_hours": 6,
                        "order": 4,
                        "description": "cProfile, memory_profiler, pytest fixtures, parameterized testing, and CI automation.",
                        "milestones": ["Pytest Suite Architecture", "Profiling CPU Bottlenecks", "C-Extension Bindings with PyO3"],
                    },
                ],
            },
            {
                "title": "Django",
                "category": "Web & Backend Frameworks",
                "description": "High-level Python web framework designed for rapid development, secure authentication, ORM database integration, and clean REST APIs.",
                "icon_name": "Server",
                "is_featured": True,
                "members_count": 210,
                "topics_count": 19,
                "aliases": ["Django Framework", "Django REST Framework", "DRF", "Django Web"],
                "topics": [
                    {
                        "title": "Django Core Architecture & Request Lifecycle",
                        "difficulty": "BEGINNER",
                        "estimated_hours": 4,
                        "order": 1,
                        "description": "WSGI/ASGI dispatchers, middleware pipelines, URL routing, and view layers.",
                        "milestones": ["Middleware Execution Order", "Custom Settings Hierarchy", "Request/Response Processing"],
                    },
                    {
                        "title": "Advanced Django ORM & PostgreSQL Optimization",
                        "difficulty": "INTERMEDIATE",
                        "estimated_hours": 8,
                        "order": 2,
                        "description": "Eliminating N+1 queries, prefetch_related, conditional aggregation, and database indexes.",
                        "milestones": ["QuerySet Evaluation Mechanics", "Select/Prefetch Related Profiling", "Atomic Transactions & Row Locking"],
                    },
                    {
                        "title": "Django REST Framework & SimpleJWT Authentication",
                        "difficulty": "ADVANCED",
                        "estimated_hours": 6,
                        "order": 3,
                        "description": "Serializers, ViewSets, custom permission classes, token rotation, and API throttle rates.",
                        "milestones": ["Nested Model Serializers", "Custom Auth Permissions", "JWT Token Lifecycle & Blacklisting"],
                    },
                ],
            },
            {
                "title": "AWS",
                "category": "Cloud Infrastructure",
                "description": "Industry-standard cloud platform providing scalable compute (EC2), managed databases (RDS), storage (S3), serverless (Lambda), and zero-trust IAM.",
                "icon_name": "Cloud",
                "is_featured": True,
                "members_count": 285,
                "topics_count": 24,
                "aliases": ["Amazon Web Services", "AWS Cloud", "AWS Architecture"],
                "topics": [
                    {
                        "title": "VPC Networking, Subnets & Peering",
                        "difficulty": "INTERMEDIATE",
                        "estimated_hours": 6,
                        "order": 1,
                        "description": "Designing multi-AZ VPCs, public/private subnets, NAT gateways, and transit gateways.",
                        "milestones": ["Multi-AZ Subnet Partitioning", "Route Tables & Internet Gateways", "VPC Flow Logs & Security Groups"],
                    },
                    {
                        "title": "IAM Zero-Trust Security Policies & Roles",
                        "difficulty": "INTERMEDIATE",
                        "estimated_hours": 5,
                        "order": 2,
                        "description": "Least-privilege permission boundaries, role assumption, STS tokens, and service control policies.",
                        "milestones": ["ABAC & RBAC Policy Construction", "Cross-Account IAM Roles", "Secrets Manager Integration"],
                    },
                    {
                        "title": "Container Orchestration with ECS & EKS",
                        "difficulty": "ADVANCED",
                        "estimated_hours": 8,
                        "order": 3,
                        "description": "Deploying production container workloads on ECS Fargate and EKS Kubernetes clusters.",
                        "milestones": ["ECS Task Definitions & ALB", "EKS Cluster Provisioning", "Auto-scaling & CloudWatch Metrics"],
                    },
                ],
            },
            {
                "title": "React",
                "category": "Frontend & UI Engineering",
                "description": "Declarative component-based JavaScript library for building responsive web user interfaces, SPAs, and state-driven web applications.",
                "icon_name": "Layers",
                "is_featured": True,
                "members_count": 395,
                "topics_count": 32,
                "aliases": ["ReactJS", "React.js", "React Web", "React Frontend"],
                "topics": [
                    {
                        "title": "Modern React 19 Hooks & State Primitives",
                        "difficulty": "BEGINNER",
                        "estimated_hours": 4,
                        "order": 1,
                        "description": "useState, useEffect, useMemo, useCallback, useId, and custom hooks architecture.",
                        "milestones": ["Component Render Lifecycle", "State Colocation Strategies", "Custom Hook Extraction"],
                    },
                    {
                        "title": "Client-Side Routing & Global State Architecture",
                        "difficulty": "INTERMEDIATE",
                        "estimated_hours": 6,
                        "order": 2,
                        "description": "React Router 7, Context API providers, Zustand/Redux Toolkit, and performance boundaries.",
                        "milestones": ["Protected Route Guards", "Context Split Patterns", "Axios Interceptor Integration"],
                    },
                ],
            },
            {
                "title": "DevOps",
                "category": "Cloud & Infrastructure",
                "description": "Continuous integration, continuous deployment (CI/CD), infrastructure as code (IaC), observability, and automated system reliability.",
                "icon_name": "GitBranch",
                "is_featured": True,
                "members_count": 310,
                "topics_count": 22,
                "aliases": ["DevOps Engineering", "CI/CD", "Site Reliability Engineering", "SRE"],
                "topics": [
                    {
                        "title": "Infrastructure as Code with Terraform",
                        "difficulty": "INTERMEDIATE",
                        "estimated_hours": 6,
                        "order": 1,
                        "description": "State locking with S3/DynamoDB, reusable Terraform modules, and environment workspaces.",
                        "milestones": ["Remote State Architecture", "Modular VPC Infrastructure", "Terraform Plan Automation"],
                    },
                    {
                        "title": "GitHub Actions CI/CD Pipeline Engineering",
                        "difficulty": "INTERMEDIATE",
                        "estimated_hours": 5,
                        "order": 2,
                        "description": "Automated linting, matrix test execution, Docker build caching, and staging deployment.",
                        "milestones": ["Multi-stage Build & Test Workflows", "OIDC AWS Authentication", "Automated Rollback Triggers"],
                    },
                ],
            },
        ]

        for item in core_domains:
            domain, _ = CommunityDomain.objects.get_or_create(
                slug=slugify(item["title"]),
                defaults={
                    "title": item["title"],
                    "category": item["category"],
                    "description": item["description"],
                    "icon_name": item["icon_name"],
                    "is_featured": item["is_featured"],
                    "members_count": item["members_count"],
                    "topics_count": item["topics_count"],
                    "is_approved": True,
                    "is_public": True,
                    "status": CommunityDomain.Status.APPROVED,
                },
            )

            for alias_name in item.get("aliases", []):
                DomainAlias.objects.get_or_create(
                    domain=domain,
                    alias=alias_name,
                )

            for t_data in item.get("topics", []):
                topic, _ = CurriculumTopic.objects.get_or_create(
                    domain=domain,
                    slug=slugify(t_data["title"]),
                    defaults={
                        "title": t_data["title"],
                        "difficulty": t_data.get("difficulty", "INTERMEDIATE"),
                        "estimated_hours": t_data.get("estimated_hours", 6),
                        "order": t_data.get("order", 0),
                        "description": t_data.get("description", ""),
                        "is_core": True,
                        "is_approved": True,
                    },
                )
                for idx, m_title in enumerate(t_data.get("milestones", [])):
                    TopicMilestone.objects.get_or_create(
                        topic=topic,
                        title=m_title,
                        defaults={"order": idx + 1},
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded canonical core domains, aliases, curriculum topics, and milestones."
            )
        )
