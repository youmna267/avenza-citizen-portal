#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  Avenza Citizen Services Portal — K3s Deploy Script
#  Run from the project root (where docker-compose.yml lives)
#  Usage: bash k8s/deploy.sh
# ═══════════════════════════════════════════════════════════
set -e

# Colours for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ─── Pre-flight checks ──────────────────────────────────────
command -v kubectl >/dev/null 2>&1 || error "kubectl not found. Is K3s installed?"
command -v docker  >/dev/null 2>&1 || error "docker not found. Is Docker installed?"

info "Starting Avenza K3s deployment..."

# ─── Step 1: Build Docker images ───────────────────────────
info "Building backend Docker image..."
docker build -t avenza-backend:latest ./backend
success "Backend image built"

info "Building frontend Docker image..."
docker build -t avenza-frontend:latest ./frontend
success "Frontend image built"

# ─── Step 2: Import images into K3s ────────────────────────
# K3s uses its own container runtime (containerd) which is
# separate from Docker. Images must be imported explicitly.
info "Importing images into K3s containerd..."
docker save avenza-backend:latest | sudo k3s ctr images import -
docker save avenza-frontend:latest | sudo k3s ctr images import -
success "Images imported into K3s"

# ─── Step 3: Apply manifests in dependency order ────────────
info "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

info "Applying Secrets..."
kubectl apply -f k8s/secrets/postgres-secret.yaml
kubectl apply -f k8s/secrets/redis-secret.yaml
kubectl apply -f k8s/secrets/backend-secret.yaml

info "Applying ConfigMaps..."
kubectl apply -f k8s/configmaps/postgres-init-configmap.yaml
kubectl apply -f k8s/configmaps/backend-configmap.yaml
kubectl apply -f k8s/configmaps/frontend-configmap.yaml

info "Deploying PostgreSQL..."
kubectl apply -f k8s/postgres/postgres-pvc.yaml
kubectl apply -f k8s/postgres/postgres-deployment.yaml
kubectl apply -f k8s/postgres/postgres-service.yaml

info "Waiting for PostgreSQL to be ready..."
kubectl rollout status deployment/postgres -n avenza --timeout=120s
success "PostgreSQL ready"

info "Deploying Redis..."
kubectl apply -f k8s/redis/redis-pvc.yaml
kubectl apply -f k8s/redis/redis-deployment.yaml
kubectl apply -f k8s/redis/redis-service.yaml

info "Waiting for Redis to be ready..."
kubectl rollout status deployment/redis -n avenza --timeout=60s
success "Redis ready"

info "Deploying Backend..."
kubectl apply -f k8s/backend/backend-deployment.yaml
kubectl apply -f k8s/backend/backend-service.yaml

info "Waiting for Backend to be ready..."
kubectl rollout status deployment/backend -n avenza --timeout=120s
success "Backend ready"

info "Deploying Frontend..."
kubectl apply -f k8s/frontend/frontend-deployment.yaml
kubectl apply -f k8s/frontend/frontend-service.yaml

info "Waiting for Frontend to be ready..."
kubectl rollout status deployment/frontend -n avenza --timeout=120s
success "Frontend ready"

info "Applying Ingress..."
kubectl apply -f k8s/ingress/ingress.yaml

# ─── Step 4: Print access info ─────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  Avenza K3s Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
echo -e "  ${BLUE}Node IP:${NC}       $NODE_IP"
echo -e "  ${BLUE}Frontend:${NC}      http://$NODE_IP:30080"
echo -e "  ${BLUE}Backend API:${NC}   http://$NODE_IP:30080/api/v1"
echo -e "  ${BLUE}Swagger UI:${NC}    http://$NODE_IP:30080/api/docs"
echo -e "  ${BLUE}Health:${NC}        http://$NODE_IP:30080/api/v1/health"
echo ""
echo -e "  For Ingress access, add to /etc/hosts:"
echo -e "    $NODE_IP  avenza.local"
echo -e "  Then open: http://avenza.local"
echo ""
echo -e "  Admin login:"
echo -e "    Email:    admin@citizenportal.gov"
echo -e "    Password: Admin@2026Secure"
echo ""
