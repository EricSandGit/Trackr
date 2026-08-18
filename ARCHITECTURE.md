# Trackr — Arquitectura Técnica y Estándares de Código

Este documento establece las directrices arquitectónicas, la estructura de carpetas, las convenciones de código y los patrones de diseño que **DEBEN cumplirse estrictamente** durante el desarrollo de **Trackr**.

---

## 1. Principios de Diseño de Software

1. **Separación Estricta de Responsabilidades:** La lógica de negocio pura (algoritmos de heatmap, cálculo de rachas, récords) reside en funciones puras y servicios independientes, nunca acoplada a la vista (JSX).
2. **Local-First & Desacoplamiento de Persistencia:** La interfaz interactúa exclusivamente a través de interfaces (`IStorageAdapter`). El motor de almacenamiento es intercambiable sin alterar los componentes UI.
3. **Cero Dependencias Pesadas Innecesarias:** Estilos con Vanilla CSS Modules y variables CSS nativas. Estado reactivo ultra ligero con Zustand.
4. **Tipado Estricto de Extremo a Extremo:** TypeScript en modo estricto (`strict: true`), con prohibición absoluta del tipo `any`.
5. **Mobile-First & Feedback Táctil:** Diseñado para interacción fluida en teléfonos móviles con respuesta háptica y animaciones performantes a 60fps.

---

## 2. Estructura de Directorios del Proyecto

```plaintext
Trackr/
├── .agents/
│   └── rules/
│       └── trackr-standards.md       # Reglas de workspace para agentes AI
├── public/
│   ├── favicon.svg
│   ├── manifest.json                 # Configuración PWA Mobile-First
│   └── icons/
├── src/
│   ├── app/                          # Vistas y composición de pantallas principales
│   │   ├── HomeView/
│   │   │   ├── HomeView.tsx
│   │   │   ├── HomeView.module.css
│   │   │   └── index.ts
│   │   └── HabitDetailView/
│   │       ├── HabitDetailView.tsx
│   │       ├── HabitDetailView.module.css
│   │       └── index.ts
│   │
│   ├── core/                         # Utilidades y elementos transversales
│   │   ├── types/                    # Modelos de datos globales e interfaces
│   │   │   ├── habit.ts
│   │   │   ├── log.ts
│   │   │   ├── stats.ts
│   │   │   └── index.ts
│   │   ├── theme/                    # Design Tokens y gestión de temas
│   │   │   ├── tokens.css            # Variables CSS (colores, espaciados, bordes)
│   │   │   └── useThemeStore.ts      # Store para alternar Claro / Oscuro
│   │   ├── ui/                       # Componentes UI atómicos y reutilizables
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── BottomSheet/
│   │   │   ├── Checkbox/
│   │   │   ├── Input/
│   │   │   └── Icon/
│   │   └── utils/                    # Funciones puras utilitarias
│   │       ├── dateUtils.ts          # Manipulación y formateo de fechas
│   │       ├── haptics.ts            # Feedback de vibración táctil
│   │       └── idGenerator.ts        # Generador de UUIDs/IDs
│   │
│   ├── services/                     # Capa de infraestructura y persistencia
│   │   └── storage/
│   │       ├── IStorageAdapter.ts    # Contrato abstracto de almacenamiento
│   │       ├── LocalStorageAdapter.ts# Implementación local por defecto
│   │       ├── JsonBackupService.ts  # Servicio de Exportar/Importar JSON
│   │       └── index.ts
│   │
│   ├── features/                     # Módulos de dominio funcionales
│   │   ├── habits/                   # Gestión del ciclo de vida de hábitos
│   │   │   ├── components/           # HabitList, HabitCard, HabitFormModal
│   │   │   ├── store/                # useHabitsStore.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── heatmap/                  # Motor y renderizado de celdas de calor
│   │   │   ├── components/           # GlobalHeatmap, MonthlyGrid, AnnualHeatmap
│   │   │   ├── logic/                # heatmapCalculator.ts (funciones puras)
│   │   │   └── index.ts
│   │   │
│   │   ├── logging/                  # Registro rápido de actividad y volumen
│   │   │   ├── components/           # QuickLogBottomSheet, VolumeKeypad
│   │   │   ├── store/                # useLogsStore.ts
│   │   │   └── index.ts
│   │   │
│   │   └── stats/                    # Motor de análisis de constancia y récords
│   │       ├── components/           # ConsistencyOverview, HabitStatBadges
│   │       ├── logic/                # streakCalculator.ts, recordDetector.ts
│   │       └── index.ts
│   │
│   ├── main.tsx                      # Punto de entrada de la aplicación
│   └── index.css                     # Estilos globales y reset
│
├── ARCHITECTURE.md                   # Este documento maestro
├── SPECIFICATION.md                  # Especificación funcional de producto
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 3. Patrones de Diseño y Capas Arquitectónicas

### 3.1. Patrón Repository / Storage Adapter
Toda operación de lectura o escritura de datos debe pasar por la interfaz `IStorageAdapter`.

```typescript
// src/services/storage/IStorageAdapter.ts
import { Habit, DailyActivityLog } from '@/core/types';

export interface IStorageAdapter {
  // Hábitos
  getHabits(): Promise<Habit[]>;
  saveHabit(habit: Habit): Promise<void>;
  deleteHabit(id: string): Promise<void>;
  
  // Registros diarios
  getLogs(): Promise<DailyActivityLog[]>;
  getLogsByHabit(habitId: string): Promise<DailyActivityLog[]>;
  saveLog(log: DailyActivityLog): Promise<void>;
  deleteLog(id: string): Promise<void>;
  
  // Copia de seguridad
  exportBackup(): Promise<string>;
  importBackup(jsonData: string): Promise<boolean>;
}
```

### 3.2. Gestión de Estado con Zustand
Los stores deben ser pequeños, especializados y con acciones atómicas e inmutables.

---

## 4. Convenciones de Código y Estilo

### 4.1. Reglas Estrictas de TypeScript
* **Prohibido `any`:** Usar `unknown`, tipos genéricos o uniones discriminadas.
* **Interfaces Inmutables:** Los modelos de datos deben tiparse con claridad.
* **Importaciones Absolutas:** Usar alias de rutas configurados en `tsconfig.json` (ej: `@/core/...`, `@/features/...`, `@/services/...`).

### 4.2. Co-locación de Componentes
Cada componente UI o de feature debe tener su propio directorio aislado:
```plaintext
MyComponent/
├── MyComponent.tsx           # Lógica y marcado JSX
├── MyComponent.module.css    # Estilos CSS Modules con variables locales/globales
└── index.ts                  # export * from './MyComponent';
```

### 4.3. Nomenclatura
* **Componentes:** `PascalCase` (`GlobalHeatmap.tsx`)
* **Hooks:** `camelCase` con prefijo `use` (`useStreakCalculator.ts`)
* **Utilidades / Lógica:** `camelCase` (`calculateIntensity.ts`)
* **Interfaces:** `PascalCase` (`DailyActivityLog`)
* **Constantes:** `UPPER_SNAKE_CASE` (`DEFAULT_HABIT_COLORS`)
* **Tokens CSS:** Prefijo `--tk-*` (`--tk-bg-main`, `--tk-cell-level-4`)

### 4.4. Funciones Puras para Lógica de Dominio
Los cálculos matemáticos y lógicos deben residir en archivos dedicados `logic/*.ts` como funciones puras y sin efectos secundarios.
