-- Nox — init do Postgres em dev local.
-- Em produção o Supabase já traz essas extensões.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Schema dedicado (Alembic cria as tabelas depois com search_path padrão).
-- Mantém public limpo caso queira usar extensões isoladas.
