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

Projeto: [roteiro-viagem](https://vercel.com/afonso-rodrigues/roteiro-viagem)  
URL de produção: **https://roteiro-viagem.vercel.app** (após configurar domínio e proteção abaixo)

O build no GitHub/Vercel está passando. Se você vê `404 NOT_FOUND` (texto plano da Vercel) ou outro site no domínio, ajuste no dashboard:

1. **Deployment Protection** → Settings → Deployment Protection → em **Production**, desative “Vercel Authentication” (deixe proteção só em Preview, se quiser).
2. **Domínio** → Settings → Domains → confirme que `roteiro-viagem.vercel.app` está neste projeto (não em outro). O deploy de produção deve estar ligado ao branch `main`.
3. URLs antigas de deploy (`roteiro-viagem-henna.vercel.app`, etc.) expiram quando o deploy é removido — use o domínio de produção do projeto.

### Variáveis de ambiente (Settings → Environment Variables)

| Variável | Valor |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://viagem:...@cluster0.9qmia0k.mongodb.net/viagem?...` |
| `MONGODB_DB` | `viagem` |
| `APP_USER` | usuário de login (ex.: `roteiro`) |
| `APP_PASSWORD` | senha de login |
| `SESSION_SECRET` | string aleatória longa |

Credenciais locais de teste ficam em `.login-local` (não vai pro git).

No **MongoDB Atlas** → Network Access: liberar `0.0.0.0/0` (ou IPs da Vercel).

### Publicar atualizações

O projeto Vercel está ligado ao repo `afonsoaugusto/roteiro-viagem`. Para deploy automático:

```sh
git push origin main
```

