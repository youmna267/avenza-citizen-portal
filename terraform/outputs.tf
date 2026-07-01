output "server_public_ip" {
  description = "Public IP of the Avenza server"
  value       = aws_eip.avenza_eip.public_ip
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "http://${aws_eip.avenza_eip.public_ip}:30090"
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${aws_eip.avenza_eip.public_ip}:30091/api/v1"
}

output "swagger_url" {
  description = "Swagger API docs"
  value       = "http://${aws_eip.avenza_eip.public_ip}:30091/api/docs"
}

output "argocd_url" {
  description = "ArgoCD UI"
  value       = "http://${aws_eip.avenza_eip.public_ip}:32015"
}

output "ssh_command" {
  description = "SSH command to connect to server"
  value       = "ssh ubuntu@${aws_eip.avenza_eip.public_ip}"
}
