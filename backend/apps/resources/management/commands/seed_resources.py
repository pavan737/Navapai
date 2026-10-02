from django.core.management.base import BaseCommand
from apps.resources.models import Resource


class Command(BaseCommand):
    help = "Seeds initial high-quality developer learning resources (Phase 10)."

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding curated developer learning resources...")

        resources_data = [
            {
                "title": "PostgreSQL Official Documentation",
                "description": "Comprehensive reference manual for PostgreSQL database architecture, SQL syntax, indexes, and performance tuning.",
                "url": "https://www.postgresql.org/docs/",
                "resource_type": Resource.Type.DOCUMENTATION,
                "category": "Databases",
                "difficulty": Resource.Difficulty.ALL_LEVELS,
                "author_or_creator": "PostgreSQL Global Development Group",
                "is_featured": True,
            },
            {
                "title": "AWS Cloud Practitioner & Solution Architecture Guide",
                "description": "Official Amazon Web Services documentation covering EC2, S3, IAM, VPC networking, and cloud architecture patterns.",
                "url": "https://aws.amazon.com/documentation/",
                "resource_type": Resource.Type.DOCUMENTATION,
                "category": "Cloud Infrastructure",
                "difficulty": Resource.Difficulty.BEGINNER,
                "author_or_creator": "Amazon Web Services",
                "is_featured": True,
            },
            {
                "title": "Kubernetes Production Handbook & Reference",
                "description": "In-depth guide to Kubernetes container orchestration, Pod deployment, Services, Ingress controllers, and Helm charts.",
                "url": "https://kubernetes.io/docs/home/",
                "resource_type": Resource.Type.DOCUMENTATION,
                "category": "Containerization & Cloud",
                "difficulty": Resource.Difficulty.INTERMEDIATE,
                "author_or_creator": "Cloud Native Computing Foundation (CNCF)",
                "is_featured": True,
            },
            {
                "title": "Django REST Framework Complete Tutorial",
                "description": "Step-by-step masterclass on building RESTful APIs with DRF, authentication, serializers, permissions, and viewsets.",
                "url": "https://www.django-rest-framework.org/",
                "resource_type": Resource.Type.DOCUMENTATION,
                "category": "Web & Backend Frameworks",
                "difficulty": Resource.Difficulty.INTERMEDIATE,
                "author_or_creator": "Encode / Tom Christie",
                "is_featured": True,
            },
            {
                "title": "React 19 Official Documentation & Hooks Guide",
                "description": "Modern React guides on Server Components, useActionState, useEffect optimization, and state management patterns.",
                "url": "https://react.dev/",
                "resource_type": Resource.Type.DOCUMENTATION,
                "category": "Programming & Languages",
                "difficulty": Resource.Difficulty.BEGINNER,
                "author_or_creator": "Meta Open Source",
                "is_featured": True,
            },
            {
                "title": "Full Stack Open 2026 - Deep Dive to Modern Web Development",
                "description": "University of Helsinki's renowned free course covering React, Redux, Node.js, Express, MongoDB, TypeScript, and GraphQL.",
                "url": "https://fullstackopen.com/en/",
                "resource_type": Resource.Type.COURSE,
                "category": "Web & Backend Frameworks",
                "difficulty": Resource.Difficulty.ALL_LEVELS,
                "author_or_creator": "University of Helsinki",
                "is_featured": True,
            },
            {
                "title": "System Design Primer by Donne Martin",
                "description": "Learn how to design large-scale systems, microservices, load balancers, caching layers, and distributed databases.",
                "url": "https://github.com/donnemartin/system-design-primer",
                "resource_type": Resource.Type.GITHUB_REPO,
                "category": "Security & Networking",
                "difficulty": Resource.Difficulty.ADVANCED,
                "author_or_creator": "Donne Martin",
                "is_featured": True,
            },
            {
                "title": "Docker Deep Dive Masterclass",
                "description": "Learn container virtualization, Dockerfiles, docker-compose, multi-stage builds, and container security best practices.",
                "url": "https://docs.docker.com/get-started/",
                "resource_type": Resource.Type.ARTICLE,
                "category": "Containerization & Cloud",
                "difficulty": Resource.Difficulty.BEGINNER,
                "author_or_creator": "Docker Team",
                "is_featured": False,
            },
        ]

        count = 0
        for item in resources_data:
            res, created = Resource.objects.get_or_create(
                url=item["url"],
                defaults=item,
            )
            if created:
                count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} resources."))
