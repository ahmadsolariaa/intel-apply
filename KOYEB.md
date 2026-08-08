# Koyeb deployment

## What you need
1. [Koyeb account](https://app.koyeb.com)
2. [Neon](https://neon.tech) free Postgres (or any Postgres URL)
3. GitHub repo with this project (root contains `web/` + `vendor/`)

## Environment variables (Service → Environment)

| Name | Value |
|------|--------|
| `DATABASE_URL` | `postgresql://USER:PASSWORD@HOST/DB?sslmode=require` |
| `AUTH_SECRET` | long random string |
| `NODE_ENV` | `production` |

## Deploy via Koyeb UI (Docker)

1. Push this repo to GitHub
2. Koyeb → **Create Web Service** → **GitHub**
3. Select the repo, branch `main`
4. Builder: **Dockerfile**
5. Dockerfile location: `/Dockerfile` (repo root)
6. Port: **3000**
7. Add env vars above
8. Deploy

Public URL will look like:

`https://intel-apply-<org>.koyeb.app`

## Demo login (after first seed)

- Email: `goabroad.uz@gmail.com`
- Password: `Poiuytrewq8!`

## Local Docker build (optional)

```bash
docker build -t intel-apply .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="change-me" \
  intel-apply
```
