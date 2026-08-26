---
name: git-workflow
description: >-
  Manages Git branching, atomic semantic commits, PR dependency checks,
  pre-transition checkpoints, and GitHub Pull Requests. Use this skill whenever
  implementing features, fixing bugs, refactoring, or managing project versions.
---

# 🌿 Git Workflow & Atomic Commits Protocol

Esta skill define el protocolo obligatorio para el ciclo de vida de desarrollo con Git y GitHub en el proyecto Trackr.

---

## 🎯 Principios Fundamentales

1. **Prevención de Conflictos y Verificación Previa:** Antes de crear una rama, verificar si hay Pull Requests activas en GitHub y determinar si la nueva tarea depende de ellas.
2. **Ramas Dedicadas:** Nunca desarrollar directamente sobre `main`. Cada tarea debe tener su propia rama de trabajo.
3. **Continuidad en Ajustes:** Si el usuario solicita ajustes o mejoras sobre la funcionalidad de la PR activa, continuar en la misma rama en vez de fragmentar el trabajo en ramas innecesarias.
4. **Commits Atómicos y Frecuentes:** Guardar cambios en partes mínimas, autocontenidas y lógicas (1 componente, 1 función, 1 refactor).
5. **Pausa y Confirmación entre Tareas:** Antes de pasar de una parte a otra del proyecto o antes de commitear si el usuario está probando, consultar al usuario.
6. **No Auto-Merge:** El agente **NUNCA** debe mergear los Pull Requests. El merge lo realiza el usuario desde la interfaz de GitHub.
7. **Recordatorio de Cierre Total:** Al cumplir el 100% de los requerimientos especificados por el usuario, verificar la compilación (`npm run build`), hacer el push final y presentar el enlace para abrir y mergear el Pull Request.

---

## 📋 Fases del Flujo de Trabajo

### Fase 1: Verificación de PRs Activas y Creación de Rama (*Pre-Branching Check*)

Antes de escribir o modificar código, evaluar el contexto actual:

#### 1. ¿Es un ajuste o continuación de la tarea actual?
* **Acción:** Continuar trabajando en la **misma rama** (ej. `feat/all-habits-view`).
* Al hacer `git push`, los nuevos commits se sumarán automáticamente al Pull Request existente en GitHub.

#### 2. ¿Es una nueva tarea que depende de una PR que aún no se mergeó en `main`?
* **Riesgo:** Si creamos la rama desde `main`, no contendrá el código nuevo y provocará *merge conflicts* al fusionar.
* **Acción recomendada:**
  1. Recordar al usuario: *"Hay una PR activa en GitHub con cambios necesarios. Por favor haz el merge en GitHub primero para actualizar `main`."*
  2. Una vez mergeada por el usuario:
     ```bash
     git checkout main
     git pull origin main
     git checkout -b feat/nueva-feature
     ```
  3. *(Alternativa si el usuario prefiere no mergear aún):* Ramificar directamente a partir de la rama activa (`git checkout -b feat/nueva-feature feat/rama-anterior`).

#### 3. ¿Es una nueva tarea independiente (o la PR anterior ya está mergeada)?
* **Acción:**
  ```bash
  git checkout main
  git pull origin main
  git checkout -b feat/nombre-descriptivo
  ```
  * **Nuevas funcionalidades:** `feat/nombre-descriptivo` (ej: `feat/metas-semanales`, `feat/filtro-categorias`)
  * **Corrección de errores:** `fix/nombre-bug` (ej: `fix/recorte-filtro-chips`, `fix/calculo-racha`)
  * **Refactorizaciones o estilos:** `refactor/nombre-modulo` o `style/nueva-paleta`
  * **Documentación:** `docs/actualizar-readme`

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
   git push origin <nombre-rama>
   ```
3. **Presentación al Usuario:**
   * Mostrar un resumen claro y ordenado de todos los commits realizados en la rama.
   * Generar el enlace directo para abrir el Pull Request en GitHub:
     `https://github.com/<Usuario>/<Repositorio>/pull/new/<nombre-rama>`
   * Recordarle amablemente que revise los cambios y haga el **Merge** en la web de GitHub.
