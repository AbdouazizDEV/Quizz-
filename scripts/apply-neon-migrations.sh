#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIG_DIR="$ROOT/supabase/migrations"
COMPAT="$ROOT/supabase/neon/000_supabase_compat.sql"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL manquant. Exporte la chaine Neon non-poolée avant d'exécuter."
  exit 1
fi

export PGSSLMODE="${PGSSLMODE:-require}"

psql_cmd() {
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 "$@"
}

echo "==> Compatibilité auth (Neon)"
psql_cmd -f "$COMPAT"

mapfile -t files < <(ls -1 "$MIG_DIR"/*.sql | sort)

for file in "${files[@]}"; do
  base="$(basename "$file")"
  version="${base%%_*}"
  name="${base#*_}"
  name="${name%.sql}"

  already="$(psql "$DATABASE_URL" -Atqc "SELECT 1 FROM public.schema_migrations WHERE version = '$version' LIMIT 1")"
  if [[ "$already" == "1" ]]; then
    echo "==> skip $base"
    continue
  fi

  echo "==> apply $base"
  psql_cmd -f "$file"
  psql_cmd -c "INSERT INTO public.schema_migrations (version, name) VALUES ('$version', '$name');"
done

echo "==> OK"
psql_cmd -c "SELECT version, name, applied_at FROM public.schema_migrations ORDER BY version;"
psql_cmd -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
