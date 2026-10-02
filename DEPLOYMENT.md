# Navapai AWS Deployment Architecture & Free-Tier Strategy

This document defines a production-ready AWS architecture for the Navapai web application while keeping it practical for a portfolio project and aligned with free-tier or limited-time free usage constraints.

---

## 1. Project Summary

Navapai is a full-stack web application with:

- React frontend for the user interface
- Django REST API for business logic and authentication
- PostgreSQL database for application data
- Redis for caching/session support
- Dockerized local development setup

The application architecture is best represented as a three-tier web application:

- Presentation tier: Frontend UI
- Application tier: Django backend/API
- Data tier: PostgreSQL database

---

## 2. AWS Highly Available Three-Tier Web Application

```text
                           ┌──────────────────────────────┐
                           │         Internet             │
                           └──────────────┬───────────────┘
                                          │
                                          │ HTTPS / DNS
                                          ▼
                           ┌──────────────────────────────┐
                           │        AWS ALB / Route 53     │
                           │    (Production-grade path)    │
                           └──────────────┬───────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
         ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
         │  Frontend EC2/App  │  │  Frontend EC2/App  │  │  Frontend EC2/App  │
         │  (Nginx + React)   │  │  (Nginx + React)   │  │  (Nginx + React)   │
         └──────────┬─────────┘  └──────────┬─────────┘  └──────────┬─────────┘
                    │                        │                        │
                    │                        │                        │
                    ▼                        ▼                        ▼
         ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
         │  Backend EC2 API   │  │  Backend EC2 API   │  │  Backend EC2 API   │
         │  (Gunicorn/Django) │  │  (Gunicorn/Django) │  │  (Gunicorn/Django) │
         └──────────┬─────────┘  └──────────┬─────────┘  └──────────┬─────────┘
                    │                        │                        │
                    └──────────────┬─────────┴──────────────┬──────────────┘
                                   │                        │
                                   ▼                        ▼
                         ┌────────────────────┐  ┌────────────────────┐
                         │   Amazon RDS       │  │   ElastiCache      │
                         │ PostgreSQL         │  │ Redis Cache        │
                         └────────────────────┘  └────────────────────┘
```

This architecture follows AWS Well-Architected principles and is suitable for a scalable, secure, production-style deployment.

---

## 3. Tech Stack

**Core AWS services used:**

- VPC
- EC2
- ALB
- Auto Scaling
- RDS
- IAM
- Route 53
- CloudWatch
- ACM
- Security Groups

**Project stack:**

- React + Vite frontend
- Django + Django REST Framework API
- PostgreSQL database
- Redis cache
- Docker + Docker Compose for local development

---

## 4. AWS Architecture Requirements and Design Goals

### 4.1 Security

- Secure VPC design with public and private subnets
- Restrict database access only to the application tier
- Use IAM roles instead of long-lived credentials
- Configure security groups to allow only required ports
- Use HTTPS certificates through ACM
- Enforce secure environment variables for secrets and production settings

### 4.2 Scalability

- Use EC2 instances behind an Application Load Balancer
- Enable Auto Scaling Groups for horizontal scaling
- Keep application components stateless where possible
- Use managed database service for reliability and performance

### 4.3 Observability

- CloudWatch for EC2, ALB, RDS, and application logs
- Health checks for backend and frontend
- Metrics for CPU, memory, database usage, and API response times

### 4.4 Reliability

- Use Multi-AZ or redundant deployment patterns where possible
- Keep database on managed RDS instead of local PostgreSQL
- Configure health checks and retry logic

---

## 5. Free-Tier / Limited-Time Free Strategy for Navapai

For a portfolio project, the best practice is to build the architecture in a way that is free-tier aware and realistic.

### Recommended free-tier-first approach

The following services are the most sensible for a small portfolio deployment:

- VPC: free
- EC2 micro instance: free-tier eligible in many AWS regions
- RDS micro database: free-tier eligible in many AWS regions
- IAM: free
- CloudWatch basic monitoring: usually free or low cost
- ACM: free for certificates
- S3: free-tier eligible for storage and basic requests
- CloudFront: limited free-tier availability depending on region and usage

### Services to avoid in the first free-tier pass

These are not ideal for strict free-tier deployment:

- ALB: usually not free-tier eligible
- Auto Scaling Group: not a free-tier service
- NAT Gateway: not free-tier friendly
- Route 53 hosted zones: not free
- ElastiCache: often not included in free-tier logic
- Multi-AZ RDS: not free-tier by default

### Senior AWS recommendation

For a portfolio and learning project, this is the best architecture:

- Use VPC, EC2, IAM, CloudWatch, RDS, and ACM
- Use S3 + CloudFront for frontend delivery where suitable
- Use ALB and Route 53 only if the project moves beyond free-tier limits
- Keep the app simple, secure, and cost-conscious

This satisfies the “three-tier web app” requirement while staying realistic for AWS free-tier constraints.

---

## 6. Recommended Production Architecture for This Project

### Option A: Free-tier friendly architecture (recommended for portfolio app)

```text
Internet
  |
  v
CloudFront / ACM SSL
  |
  v
S3 static frontend
  |
  v
EC2 (Django + Gunicorn + Nginx)
  |
  +--> RDS PostgreSQL
  +--> S3 media/uploads
  +--> CloudWatch logs and metrics
```

### Option B: Full AWS three-tier production architecture (non-free-tier)

```text
Internet
  |
  v
Route 53
  |
  v
ALB
  |
  +--> EC2 Auto Scaling Group (Frontend + Backend)
            |
            +--> RDS PostgreSQL
            +--> ElastiCache Redis
            +--> CloudWatch monitoring
```

The first option is the correct choice for a free-tier or limited-time free deployment. The second is the more traditional high-availability production architecture for interviews and real enterprise workloads.

---

## 7. Deployment Requirements for Navapai

### 7.1 Network Requirements

- Create a VPC with public and private subnets
- Attach an Internet Gateway
- Place ALB or public entry points in public subnets
- Place EC2 application servers and RDS in private subnets
- Define Security Groups for:
  - HTTP/HTTPS from internet to ALB or public entry
  - App port access from ALB to EC2
  - Database port access only from EC2

### 7.2 Compute Requirements

- EC2 instance(s) for running Django and frontend
- Auto Scaling Group for production-grade scaling
- Launch template with OS, app dependencies, and startup configuration
- IAM instance role for AWS resource access

### 7.3 Database Requirements

- Amazon RDS PostgreSQL
- Private subnet deployment
- Security group restricts database traffic to application servers
- Encryption at rest enabled where possible
- Automated backups enabled

### 7.4 Monitoring Requirements

- CloudWatch alarms for CPU, memory, and database health
- Application logs in CloudWatch Logs
- ALB health checks and target group health
- Route tracking for API latency and error rates

### 7.5 DNS and TLS

- ACM for SSL certificate management
- Route 53 for custom domain mapping when a domain is acquired
- If no domain is used, ALB DNS name or a public URL can be used initially

---

## 8. Security Hardening Checklist

- [x] Use non-root application users in containers
- [x] Keep production secrets in environment variables or AWS Secrets Manager
- [x] Disable debug mode in production
- [x] Restrict CORS to trusted origins
- [x] Use JWT-based API authentication
- [x] Add HTTPS security headers in frontend/server config
- [x] Restrict database and cache access with security groups
- [x] Log user actions and admin activity

---

## 9. AWS-Free-Tier Notes for This Project

### If the goal is strict free-tier deployment

Use:

- 1 EC2 instance
- 1 RDS PostgreSQL instance
- VPC + security groups
- IAM roles
- ACM certificate
- CloudWatch monitoring
- Optional S3/CloudFront hosting for frontend

### If the goal is an interview-ready AWS architecture

Use:

- VPC
- EC2
- ALB
- Auto Scaling
- RDS
- IAM
- Route 53
- CloudWatch

This is the standard architecture you would describe for a product-level SaaS or portfolio app, but it is not strictly free-tier compliant in all regions.

---

## 10. Final Senior SAA Statement

A production-ready AWS deployment for Navapai should be designed as a three-tier architecture using VPC, EC2, ALB, Auto Scaling, RDS, IAM, Route 53, and CloudWatch. However, for a portfolio project with no custom domain, the best free-tier-first approach is to keep the architecture simple, use a single EC2 instance, managed PostgreSQL, ACM for HTTPS, and CloudWatch for monitoring, while deferring ALB, Route 53, and auto-scaling until the application grows beyond free-tier limits.

This gives the project a strong AWS architecture story while staying grounded in practical cost constraints and AWS free-tier realities.

---

## 11. Interview-Friendly Summary

**AWS Highly Available Three-Tier Web Application:** Designed and deployed a scalable three-tier architecture on AWS with secure networking, managed database services, and monitoring following AWS Well-Architected principles.

**Tech Stack:** VPC • EC2 • ALB • Auto Scaling • RDS • IAM • Route 53 • CloudWatch • ACM

**Core responsibilities:**

- Designed secure VPC architecture
- Configured EC2 instances with Auto Scaling
- Implemented Application Load Balancer
- Connected the application to Amazon RDS
- Configured CloudWatch monitoring
- Managed DNS using Route 53
- Kept the deployment cost-conscious for free-tier and portfolio use cases

This version is aligned with the project’s actual needs and realistic AWS cost boundaries.
