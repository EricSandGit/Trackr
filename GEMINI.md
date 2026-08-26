# Reglas del Proyecto Trackr

## 🌿 Flujo de Git y Commits
Para cualquier tarea de desarrollo, creación de componentes, corrección de bugs o refactorización:
1. **Consultar y seguir siempre la skill `git-workflow`** ubicada en [`.agents/skills/git-workflow/SKILL.md`](.agents/skills/git-workflow/SKILL.md).
2. **Verificar PRs activas antes de crear ramas:** Si la nueva tarea es un ajuste de la PR activa, continuar en la misma rama; si depende de ella, pedir al usuario mergearla en GitHub antes de actualizar `main`.
3. Crear ramas dedicadas (`feat/...`, `fix/...`, etc.) y no desarrollar directamente sobre `main`.
4. Mantener commits atómicos y descriptivos en **Español** siguiendo *Conventional Commits*.
5. Antes de saltar de una tarea o componente a otro, consultar al usuario si commitear lo realizado.
6. Al completar el objetivo total, verificar la compilación (`npm run build`), hacer `push` a la rama y proveer el link para abrir y mergear el Pull Request en GitHub (nunca auto-mergear).
