---
description: Reglas y estándares de arquitectura y desarrollo de Trackr
alwaysApply: true
---

# Reglas de Desarrollo y Arquitectura — Trackr

Al generar, editar o refactorizar código para el proyecto **Trackr**, el agente **DEBE** adherirse a los siguientes estándares:

1. **Documento Maestro de Referencia:** Consultar y seguir la arquitectura definida en `ARCHITECTURE.md` y los requerimientos en `SPECIFICATION.md`.
2. **Estructura Modular por Features:**
   - Ubicar la lógica de dominio en `src/features/<feature_name>/`.
   - Colocar componentes reutilizables en `src/core/ui/`.
   - Centralizar tipos globales en `src/core/types/`.
   - Implementar la persistencia desacoplada bajo `src/services/storage/` mediante `IStorageAdapter`.
3. **TypeScript Estricto:**
   - Prohibido el uso de `any`.
   - Utilizar tipos explícitos e inmutables para modelos y stores.
4. **Co-locación de Componentes:**
   - Cada componente debe residir en su propia carpeta con `Component.tsx`, `Component.module.css` e `index.ts`.
5. **Estilos:**
   - Usar Vanilla CSS Modules y variables CSS nativas centralizadas en `src/core/theme/tokens.css`.
   - No usar TailwindCSS a menos que se solicite expresamente.
6. **Lógica de Dominio:**
   - Mantener las funciones de cálculo matemático (algoritmos de heatmap, cálculo de rachas, récords y fechas) como funciones puras y desacopladas de la UI en carpetas `logic/` o `utils/`.
