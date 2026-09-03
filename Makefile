PODMAN ?= podman
NODE_IMG ?= docker.io/library/node:22-alpine
PORT ?= 3000
CONTAINER ?= roteiro-viagem-dev
NODE_MODULES_VOL ?= roteiro-viagem_node_modules

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
	$(PODMAN) run --rm -it \
		--name $(CONTAINER) \
		-p $(PORT):3000 \
		--env-file .env.local \
		-e HOSTNAME=0.0.0.0 \
		-e PORT=3000 \
		-v "$(CURDIR)":/app \
		-v $(NODE_MODULES_VOL):/app/node_modules \
		-w /app \
		$(NODE_IMG) \
		sh -c "npm install && npm run dev"

down:
	-$(PODMAN) stop $(CONTAINER)

logs:
	$(PODMAN) logs -f $(CONTAINER)

seed:
	$(PODMAN) run --rm --env-file .env.local -v "$(CURDIR)":/app -w /app $(NODE_IMG) npm run seed

build:
	$(PODMAN) run --rm --env-file .env.local -v "$(CURDIR)":/app -w /app $(NODE_IMG) npm run build
