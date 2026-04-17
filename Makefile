# PrimeClean Platform - Makefile
REGISTRY=ghcr.io/primeclean
VERSION=$(shell git rev-parse --short HEAD)
KUBE_CTX=your-aws-or-gke-context

.PHONY: build deploy-all deploy-infra deploy-services seal-secret lint

# Build and push all microservice images
build:
	@echo "Building PrimeClean services..."
	docker build -t $(REGISTRY)/booking-service:$(VERSION) ./booking-service
	docker build -t $(REGISTRY)/rag-service:$(VERSION) ./rag-service
	@echo "Pushing images to registry..."
	docker push $(REGISTRY)/booking-service:$(VERSION)
	docker push $(REGISTRY)/rag-service:$(VERSION)
	@echo "Build complete. Version: $(VERSION)"

# Deploy Infrastructure (Flux, Prometheus, SealedSecrets)
deploy-infra:
	@echo "Deploying infrastructure..."
	kubectl apply --context $(KUBE_CTX) -f flux/clusters/production/
	flux reconcile source git flux-system --context $(KUBE_CTX)
	@echo "Infrastructure deployed successfully."

# Deploy Microservices (Updates HelmReleases/Kustomizations with new image tags)
deploy-services: build
	@echo "Deploying microservices..."
	kubectl set image deployment/booking-service booking=$(REGISTRY)/booking-service:$(VERSION) -n primeclean --context $(KUBE_CTX)
	kubectl set image deployment/rag-service rag=$(REGISTRY)/rag-service:$(VERSION) -n primeclean --context $(KUBE_CTX)
	flux reconcile kustomization primeclean-apps --context $(KUBE_CTX)
	@echo "Microservices deployed successfully."

# Master command
deploy-all: deploy-infra deploy-services
	@echo "PrimeClean Platform deployed successfully. Version: $(VERSION)"

# Helper to encrypt a new secret
seal-secret:
	@read -p "Enter secret file path (e.g., ./tmp/secrets.yaml): " SECRET_FILE; \
	kubeseal --cert sealed-secrets-cert.pem --format yaml < $$SECRET_FILE > flux/releases/primeclean-sealed-secrets.yaml; \
	echo "SealedSecret written to flux/releases/"

# Linting (pre-commit hook)
lint:
	@echo "Linting booking-service..."
	cd booking-service && ruff check . && mypy app/
	@echo "Linting frontend..."
	cd frontend && npm run lint
	@echo "All linting passed."
