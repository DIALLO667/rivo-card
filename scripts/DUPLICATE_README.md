Guide rapide pour dupliquer ce dépôt localement

But
-- Fournir un script léger pour copier le projet localement, réinitialiser Git et appliquer quelques remplacements basiques (package.json, README).

Fichier principal
- `scripts/duplicate_repo.sh` : script zsh exécutable. Usage:

```bash
./scripts/duplicate_repo.sh <nouveau-nom-de-dossier> [nouvelle-url-remote]
```

Ce que fait le script
- Copie tous les fichiers du dépôt courant vers un dossier sibling nommé `<nouveau-nom-de-dossier>` en excluant `.git`, `node_modules`, `venv`, `dist`, etc.
- Re-initialise un nouveau dépôt Git, crée un commit initial et optionnellement ajoute une remote `origin` si vous fournissez une URL.
- Tente de remplacer le champ `name` dans `frontend/package.json` (si `jq` est installé il sera utilisé, sinon un remplacement sed est appliqué).
- Remplace globalement le token `card-nfc` dans le `README.md` par le nouveau nom (best-effort).

Étapes après duplication (manuelles recommandées)
- Vérifier et mettre à jour les fichiers de licence et auteurs.
- Mettre à jour toutes les configurations CI (GitHub Actions, etc.).
- Ne pas copier d'anciens secrets: supprimer ou recréer les `.env`.
- Rechercher des identifiants de projet ou des noms d'applications hard-codés (par ex. `card-nfc`) et les ajuster.
- Créer un dépôt distant vide et pousser: `git remote add origin <url>` puis `git push -u origin main`.

Notes
- Le script est intentionnellement conservateur: il n'effectue pas de remplacements risqués sur l'ensemble des fichiers. Si vous avez besoin d'un refactor plus profond (renommage de modules Python, renommage React app slugs, changements de namespace), je peux ajouter des étapes spécifiques.
