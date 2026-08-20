---
name: git-workflow
description: >-
  Manages Git branching, atomic semantic commits, pre-transition checkpoints,
  and GitHub Pull Requests. Use this skill whenever implementing features,
  fixing bugs, refactoring, or managing project versions and Git repositories.
---

# 🌿 Git Workflow & Atomic Commits Protocol

Esta skill define el protocolo obligatorio para el ciclo de vida de desarrollo con Git y GitHub.

---

## 🎯 Principios Fundamentales

1. **Ramas Dedicadas:** Nunca desarrollar directamente sobre `main`. Cada tarea debe tener su propia rama de trabajo.
2. **Commits Atómicos y Frecuentes:** Guardar cambios en partes mínimas, autocontenidas y lógicas (1 componente, 1 función, 1 refactor).
3. **Pausa y Confirmación entre Tareas:** Antes de pasar de una parte a otra del proyecto, preguntar al usuario si prefiere commitear lo actual o seguir ajustándolo.
4. **No Auto-Merge:** El agente **NUNCA** debe mergear los Pull Requests. El merge lo realiza el usuario desde la interfaz de GitHub.
5. **Recordatorio de Cierre Total:** Al cumplir el 100% de los requerimientos especificados por el usuario, verificar la compilación (`npm run build`), hacer el push final y presentar el enlace para abrir y mergear el Pull Request.

---

## 📋 Fases del Flujo de Trabajo

### Fase 1: Creación de la Rama (*Branching*)
Antes de escribir o modificar código:
1. Asegurar que `main` esté limpia y al día:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Crear y cambiar a una nueva rama con la convención adecuada:
   * **Nuevas funcionalidades:** `feat/nombre-descriptivo` (ej: `feat/metas-semanales`, `feat/filtro-categorias`)
   * **Corrección de errores:** `fix/nombre-bug` (ej: `fix/recorte-filtro-chips`, `fix/calculo-racha`)
   * **Refactorizaciones o estilos:** `refactor/nombre-modulo` o `style/nueva-paleta`
   * **Documentación:** `docs/actualizar-readme`
   ```bash
   git checkout -b feat/nombre-feature
   ```

---

### Fase 2: Desarrollo y Commits Atómicos
Durante el desarrollo de una funcionalidad:
1. **Detección de cambios:** Revisar periódicamente con `git status` o `git diff`.
2. **Alcance mínimo:** Agrupar únicamente los archivos relacionados con ese cambio específico (ej. el componente y su CSS).
3. **Formato de Commit en Español (Conventional Commits):**
   * `feat(modulo): descripción concisa en español`
   * `fix(modulo): descripción de la corrección`
   * `style(modulo): ajuste estético o de tokens`
   * `refactor(modulo): mejora de código sin cambiar funcionalidad`
   * `docs: actualización de documentación`
   * `test: agregados o correcciones de pruebas`
4. **Ejecución:**
   ```bash
   git add <archivos-especificos>
   git commit -m "feat(categoria): agregar selector de chips en formulario"
   ```

---

### Fase 3: Pausa de Transición (*Confirmation Gate*)
Al finalizar una parte o componente y antes de comenzar a modificar otra área:
* **Preguntar al usuario:**
  > *"He terminado con [Componente / Módulo]. ¿Deseas que haga el commit de estos cambios ahora o prefieres que sigamos ajustando algo más en esta parte antes de pasar a [Siguiente Tarea]?"*
* Si el usuario confirma o aprueba, commitear y realizar `git push origin <rama>`.

---

### Fase 4: Finalización del Objetivo Total y Recordatorio de Merge
Cuando se hayan completado **todos los detalles y requerimientos solicitados por el usuario**:
1. **Verificación de Calidad:**
   Ejecutar `npm run build` (o comando de build del proyecto) para asegurar cero errores de compilación o tipado.
2. **Último Commit & Push:**
   ```bash
   git push -u origin feat/nombre-feature
   ```
3. **Presentación al Usuario:**
   * Mostrar un resumen claro y ordenado de todos los commits realizados en la rama.
   * Generar el enlace directo para abrir el Pull Request en GitHub:
     `https://github.com/<Usuario>/<Repositorio>/pull/new/<nombre-rama>`
   * Recordarle amablemente que revise los cambios y haga el **Merge** en la web de GitHub.
