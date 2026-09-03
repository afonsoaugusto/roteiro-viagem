# Roteiro

App no celular para marcar o que já foi feito e o que ainda falta na viagem. A primeira versão vem preenchida com **Salvador** (31/out–05/nov/2026). Sem nomes de viajantes na interface.

## Local (Podman)

Crie `.env.local` a partir do exemplo:

```sh
cp .env.example .env.local
```

Preencha `MONGODB_URI`, `APP_USER`, `APP_PASSWORD` e `SESSION_SECRET`.

```sh
make install
make dev
```

Abra [http://localhost:3000](http://localhost:3000).

Para só popular o banco:

```sh
make seed
```

## Vercel

Variáveis no projeto:

- `MONGODB_URI`
- `MONGODB_DB=viagem`
- `APP_USER`
- `APP_PASSWORD`
- `SESSION_SECRET`

No MongoDB Atlas, libere acesso de rede para o app na Vercel (`0.0.0.0/0` ou os IPs da plataforma).
