#!/usr/bin/env bash
# Busca en las GitHub Releases la versión a restaurar y la imprime como
#   version=1.0.N
#   commit=<sha>
# Uso:
#   resolver-release.sh latest            última Release
#   resolver-release.sh before 1.0.7      la Release anterior a 1.0.7 (si 1.0.7 no
#                                         tiene Release, devuelve la última)
#   resolver-release.sh exact 1.0.7       esa Release
# Requiere GH_TOKEN y GITHUB_REPOSITORY (los define GitHub Actions).
set -euo pipefail

modo="${1:?modo: latest | before | exact}"
arg="${2:-}"

# Tags v1.0.N de la más nueva a la más vieja
mapfile -t tags < <(gh release list --exclude-drafts --limit 50 --json tagName --jq '.[].tagName')
[ "${#tags[@]}" -gt 0 ] || { echo "No hay Releases publicadas" >&2; exit 1; }

case "$modo" in
  latest) tag="${tags[0]}" ;;
  exact)
    tag="v${arg#v}"
    gh release view "$tag" >/dev/null
    ;;
  before)
    tag="${tags[0]}"
    for i in "${!tags[@]}"; do
      if [ "${tags[$i]}" = "v${arg#v}" ]; then
        [ -n "${tags[$((i + 1))]:-}" ] || { echo "No hay Release anterior a $arg" >&2; exit 1; }
        tag="${tags[$((i + 1))]}"
        break
      fi
    done
    ;;
  *) echo "Modo desconocido: $modo" >&2; exit 1 ;;
esac

echo "version=${tag#v}"
echo "commit=$(gh api "repos/$GITHUB_REPOSITORY/commits/$tag" --jq .sha)"
