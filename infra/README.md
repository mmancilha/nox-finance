# infra/

Infraestrutura local do Nox para desenvolvimento.

- `docker-compose.yml`, Postgres 16 + Redis 7
- `postgres/init.sql`, extensões `uuid-ossp`, `pgcrypto`, `citext`

## Como subir

```bash
pnpm docker:up         # sobe em background
pnpm docker:logs       # ver logs
pnpm docker:down       # desliga
```

## Conexão

| Serviço   | Host      | Porta | User | Pass      | DB  |
| --------- | --------- | ----- | ---- | --------- | --- |
| Postgres  | localhost | 5432  | nox  | nox_dev   | nox |
| Redis     | localhost | 6379  | n/a  | n/a       | n/a |

Configurável via `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`, `REDIS_PORT` no `.env` da raiz.

## Produção

Não use este compose em produção. Em produção o Nox usa Supabase (Postgres + Auth + Storage) e Upstash Redis (serverless).
