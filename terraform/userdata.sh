#!/bin/bash
set -e

# Update system
apt-get update -y
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu
systemctl enable docker
systemctl start docker

# Install Docker Compose
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Install K3s
curl -sfL https://get.k3s.io | sh -
chmod 644 /etc/rancher/k3s/k3s.yaml
echo 'export KUBECONFIG=/etc/rancher/k3s/k3s.yaml' >> /home/ubuntu/.bashrc

# Install ArgoCD CLI
curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x /usr/local/bin/argocd

# Clone the project
cd /home/ubuntu
git clone ${github_repo} avenza-citizen-portal
chown -R ubuntu:ubuntu avenza-citizen-portal

# Deploy with K3s
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
cd /home/ubuntu/avenza-citizen-portal
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/redis/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/ingress/

echo "Avenza Citizen Portal deployed successfully!"
