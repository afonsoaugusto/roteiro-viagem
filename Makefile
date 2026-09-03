PODMAN ?= podman
COMPOSE ?= $(PODMAN) compose
NODE_IMG ?= docker.io/library/node:22-alpine
PORT ?= 3000

.PHONY: help install dev up down logs seed build

help:
	@echo "make install  - instala dependências (Podman + Node 22)"
	@echo "make dev      - sobe o app em http://localhost:$(PORT) (Podman)"
	@echo "make up       - alias de make dev"
	@echo "make down     - para o container"
	@echo "make logs     - logs do app"
	@echo "make seed     - popula o MongoDB com Salvador"
	@echo "make build    - build de produção no container"

install:
	$(PODMAN) run --rm -v "$(CURDIR)":/app -w /app $(NODE_IMG) npm install

dev up:
	$(COMPOSE) up --build

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f app

seed:
	$(PODMAN) run --rm --env-file .env.local -v "$(CURDIR)":/app -w /app $(NODE_IMG) npm run seed

build:
	$(PODMAN) run --rm --env-file .env.local -v "$(CURDIR)":/app -w /app $(NODE_IMG) npm run build
