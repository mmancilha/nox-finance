#!/usr/bin/env sh
# Nox — setup do husky após clonar o repo.
#
# O husky é instalado via `pnpm install` (script `prepare` do package.json raiz).
# Este script cria o hook pre-commit caso você precise reconfigurar manualmente.

set -e

# Cria o diretório .husky se não existir
mkdir -p .husky

# Escreve o hook pre-commit
cat > .husky/pre-commit <<'EOF'
#!/usr/bin/env sh
pnpm exec lint-staged
EOF

chmod +x .husky/pre-commit

echo "✓ Hook pre-commit instalado em .husky/pre-commit"
echo "  Roda: pnpm exec lint-staged"
