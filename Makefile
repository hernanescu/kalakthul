.PHONY: up down restart build logs logs-api logs-client shell-api shell-client db-shell clean

# Start services in detached mode
up:
	docker-compose up -d

# Stop services
down:
	docker-compose down

# Restart all services
restart:
	docker-compose restart

# Rebuild and start services
build:
	docker-compose up -d --build

# Follow logs for all services
logs:
	docker-compose logs -f

# Follow logs for API only
logs-api:
	docker-compose logs -f dnd-api

# Follow logs for Client only
logs-client:
	docker-compose logs -f dnd-client

# Open shell in API container
shell-api:
	docker exec -it dnd-api /bin/sh

# Open shell in Client container
shell-client:
	docker exec -it dnd-client /bin/sh

# Access Postgres Database
db-shell:
	docker exec -it dnd-postgres psql -U dnd_user -d dnd_db

# Full reset (Stop services and remove volumes)
clean:
	docker-compose down -v
