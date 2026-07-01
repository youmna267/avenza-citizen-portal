# ═══════════════════════════════════════════════════════════
#  Avenza Citizen Services Portal — Terraform AWS Config
#  Provisions: VPC, Subnet, Security Group, EC2, Elastic IP
#  Region: ap-south-1 (Mumbai — closest to Pakistan)
# ═══════════════════════════════════════════════════════════

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ─── Data: Get latest Ubuntu 22.04 AMI ──────────────────────
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ─── VPC ────────────────────────────────────────────────────
resource "aws_vpc" "avenza_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name    = "avenza-vpc"
    Project = "avenza-citizen-portal"
  }
}

# ─── Internet Gateway ───────────────────────────────────────
resource "aws_internet_gateway" "avenza_igw" {
  vpc_id = aws_vpc.avenza_vpc.id

  tags = {
    Name    = "avenza-igw"
    Project = "avenza-citizen-portal"
  }
}

# ─── Public Subnet ──────────────────────────────────────────
resource "aws_subnet" "avenza_public_subnet" {
  vpc_id                  = aws_vpc.avenza_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name    = "avenza-public-subnet"
    Project = "avenza-citizen-portal"
  }
}

# ─── Route Table ────────────────────────────────────────────
resource "aws_route_table" "avenza_rt" {
  vpc_id = aws_vpc.avenza_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.avenza_igw.id
  }

  tags = {
    Name    = "avenza-route-table"
    Project = "avenza-citizen-portal"
  }
}

resource "aws_route_table_association" "avenza_rta" {
  subnet_id      = aws_subnet.avenza_public_subnet.id
  route_table_id = aws_route_table.avenza_rt.id
}

# ─── Security Group ─────────────────────────────────────────
resource "aws_security_group" "avenza_sg" {
  name        = "avenza-security-group"
  description = "Security group for Avenza Citizen Portal"
  vpc_id      = aws_vpc.avenza_vpc.id

  # SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH"
  }

  # Frontend
  ingress {
    from_port   = 30090
    to_port     = 30090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Frontend NodePort"
  }

  # Backend API
  ingress {
    from_port   = 30091
    to_port     = 30091
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Backend NodePort"
  }

  # ArgoCD UI
  ingress {
    from_port   = 32015
    to_port     = 32015
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "ArgoCD UI"
  }

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name    = "avenza-sg"
    Project = "avenza-citizen-portal"
  }
}

# ─── SSH Key Pair ───────────────────────────────────────────
resource "aws_key_pair" "avenza_key" {
  key_name   = "avenza-key"
  public_key = file(var.public_key_path)

  tags = {
    Name    = "avenza-key"
    Project = "avenza-citizen-portal"
  }
}

# ─── EC2 Instance ───────────────────────────────────────────
resource "aws_instance" "avenza_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.avenza_public_subnet.id
  vpc_security_group_ids = [aws_security_group.avenza_sg.id]
  key_name               = aws_key_pair.avenza_key.key_name

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/userdata.sh", {
    github_repo = var.github_repo
  })

  tags = {
    Name    = "avenza-citizen-portal"
    Project = "avenza-citizen-portal"
  }
}

# ─── Elastic IP ─────────────────────────────────────────────
resource "aws_eip" "avenza_eip" {
  instance = aws_instance.avenza_server.id
  domain   = "vpc"

  tags = {
    Name    = "avenza-eip"
    Project = "avenza-citizen-portal"
  }
}
