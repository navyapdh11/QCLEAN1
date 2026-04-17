# PrimeClean Platform (QCLEAN1)

**Production-grade enterprise cleaning services platform** built with microservices architecture, GitOps, and AI-powered support.

## 🚀 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Edge Network                      │
│                   (Next.js Frontend)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Rewrites
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Kubernetes Cluster                          │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │ Booking Service  │    │   RAG Service    │               │
│  │   (FastAPI)      │◄──►│   (FastAPI)      │               │
│  │  Port: 8000      │    │   Port: 8001     │               │
│  └────────┬─────────┘    └────────┬─────────┘               │
│           │                       │                          │
│           ▼                       ▼                          │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │   Stripe API     │    │   OpenAI +       │               │
│  │   Xero Accounting│    │   Pinecone RAG   │               │
│  └──────────────────┘    └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                         ▲
                         │
┌─────────────────────────────────────────────────────────────┐
│               Observability Stack                            │
│  Prometheus │ Grafana │ Loki │ Tempo                        │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
QCLEAN1/
├── frontend/               # Next.js 15 + React 19
│   ├── app/               # App Router
│   │   ├── services/[slug]/  # Dynamic service pages with SEO
│   │   └── page.tsx
│   ├── components/        # RAGChatWidget, BookingCalendar
│   ├── vercel.json        # Vercel configuration
│   └── Dockerfile
├── booking-service/       # FastAPI Booking Microservice
│   ├── app/main.py        # Stripe + Xero integration
│   ├── requirements.txt
│   └── Dockerfile
├── rag-service/          # FastAPI RAG Microservice
│   ├── app/main.py        # OpenAI + Compliance checking
│   ├── requirements.txt
│   └── Dockerfile
├── flux/                  # GitOps Configuration
│   ├── clusters/production/  # Flux Kustomizations
│   ├── infrastructure/       # Prometheus, Grafana, SealedSecrets
│   └── releases/            # Service HelmReleases
├── .github/workflows/     # CI/CD Pipeline
├── Makefile              # deploy-all pipeline
└── docker-compose.yml    # Local development
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** with App Router
- **React 19**
- **Tailwind CSS**
- **Vercel AI SDK** for RAG chat streaming
- **JSON-LD Schema** for Australian Local SEO

### Backend Microservices
- **FastAPI** (Python 3.12)
- **Stripe** for payment processing (AUD)
- **Xero** for Australian accounting (GST compliance)
- **OpenAI** + **LangChain** for RAG
- **Structlog** for structured logging (Loki compatible)

### Infrastructure
- **Kubernetes** with **Flux GitOps**
- **SealedSecrets** for encrypted secrets
- **Prometheus** for metrics
- **Grafana** for dashboards
- **Loki** for log aggregation
- **Tempo** for distributed tracing

### CI/CD
- **GitHub Actions** for linting, testing, and building
- **Docker** for containerization
- **GHCR** (GitHub Container Registry)

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/navyapdh11/QCLEAN1.git
   cd QCLEAN1
   ```

2. **Set up environment variables**
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```
   
   Required environment variables:
   - `STRIPE_SECRET_KEY` - Stripe API key
   - `XERO_CLIENT_ID` - Xero OAuth client ID
   - `XERO_CLIENT_SECRET` - Xero OAuth client secret
   - `XERO_TENANT_ID` - Xero tenant ID (Australian instance)
   - `OPENAI_API_KEY` - OpenAI API key

3. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

   - Frontend: http://localhost:3000
   - Booking Service: http://localhost:8000
   - RAG Service: http://localhost:8001

### Development without Docker

```bash
# Frontend
cd frontend && npm install && npm run dev

# Booking Service
cd booking-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# RAG Service
cd rag-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

## 🌐 Deploy to Production

### Prerequisites
- Kubernetes cluster (EKS, GKE, or AKS)
- `kubectl` configured
- `flux` CLI installed
- `kubeseal` for secret encryption

### Deploy Infrastructure and Services

```bash
# Deploy everything
make deploy-all

# Or step by step
make deploy-infra     # Deploy Flux, Prometheus, Grafana
make deploy-services  # Build and deploy microservices
```

### Encrypt Secrets

```bash
# Create a Kubernetes Secret file
cat > tmp/secrets.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: primeclean-secrets
  namespace: primeclean
type: Opaque
stringData:
  STRIPE_SECRET_KEY: sk_test_...
  XERO_CLIENT_ID: ...
  XERO_CLIENT_SECRET: ...
  OPENAI_API_KEY: sk-...
EOF

# Seal the secret
make seal-secret
```

### Deploy Frontend to Vercel

```bash
cd frontend
vercel --prod
```

Ensure `NEXT_PUBLIC_URL` in Vercel matches `ALLOWED_ORIGIN` in FastAPI CORS.

## 📊 API Endpoints

### Booking Service (`:8000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/book` | Create booking with Stripe checkout |
| GET | `/api/booking/availability` | Check real-time availability |
| GET | `/health` | Health check |
| GET | `/metrics` | Prometheus metrics |

### RAG Service (`:8001`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rag/chat` | AI chat with RAG |
| POST | `/api/rag/compliance` | Check compliance requirements |
| GET | `/health` | Health check |
| GET | `/metrics` | Prometheus metrics |

## 🔍 Australian Local SEO

The platform includes dynamic JSON-LD schema markup for:
- **LocalBusiness** schema
- **Service** schema
- **Offer** schema with AUD pricing
- **AreaServed** for NSW, VIC, QLD, WA, SA

Optimized for search terms:
- "Office Cleaning Sydney"
- "Medical Cleaning Melbourne"
- "Industrial Cleaning Brisbane"

## 📈 Observability

### Tracing Flow
```
User Click → Vercel Edge → K8s Ingress → FastAPI → Stripe/Xero
                                              ↓
                                         Grafana Dashboard
```

### Grafana Dashboards
- **Prometheus**: Service metrics (CPU, memory, request rate)
- **Loki**: Application logs
- **Tempo**: Distributed traces

## 🧪 Testing

```bash
# Frontend
cd frontend && npm run lint

# Backend
cd booking-service && ruff check app/ && mypy app/
cd rag-service && ruff check app/ && mypy app/

# All services
make lint
```

## 🔐 Security

- **CORS**: Strict origin policy (Vercel domain only)
- **SealedSecrets**: Encrypted Kubernetes secrets
- **HTTPS**: Enforced via Vercel and K8s Ingress
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, CSP
- **Structured Logging**: No sensitive data in logs

## 🇦🇺 Australian Compliance

- **GST**: Calculated at 10% (TaxType: "GST on Income")
- **Xero**: ACCREC invoices with Australian tax codes
- **Standards**: AS/NZS 4146:2000, NHMRC Guidelines
- **Currency**: AUD throughout

## 📝 License

Private - PrimeClean Platform 2026
