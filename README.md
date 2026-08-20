# 🎯 Trackr — Habit & Activity Tracker

> **Seguimiento visual de hábitos y actividades personales con mapas de calor interactivos estilo GitHub, metas periódicas y arquitectura Local-First.**

[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-f05032?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Características Principales

### 🟩 1. Mapas de Calor estilo GitHub (Contribution Heatmaps)
- **Matriz Global de 52 Semanas:** Visualiza la constancia ponderada de todos tus hábitos en una cuadrícula con 5 niveles de intensidad verde GitHub.
- **Calendario Mensual Interactivo:** Vista detallada de cada mes para marcar o ajustar registros con un solo toque.
- **Heatmap Anual Expandible:** Historial completo del año para cada hábito individual.

### 📊 2. Hábitos Cuantitativos y Gráficos de Evolución
- **Soporte Cuantitativo:** Define metas en minutos, páginas, kilómetros, repeticiones, vasos de agua, etc.
- **Histograma & Curva de Evolución SVG:** Gráfico interactivo con selector de períodos (**Mensual**, **Anual**, **Histórico**).
- **Líneas de Referencia:** Muestra la **Meta** establecida y calcula dinámicamente el **Promedio** histórico real.

### 🎯 3. Metas Periódicas (Semanales y Mensuales)
- Define objetivos a corto y mediano plazo (ej. *4 días por semana*, *150 páginas semanales* o *600 páginas mensuales*).
- **Cálculo Inteligente:** Botón *"Sugerir metas"* para generar objetivos equilibrados según tu frecuencia o meta diaria.
- **Tarjetas de Progreso:** Indicadores de días restantes, barras de avance animadas y badges especiales al alcanzar el objetivo.

### 🏷️ 4. Categorías & Filtros Rápidos
- Clasifica tus hábitos con etiquetas temáticas (*Salud & Deporte*, *Productividad*, *Estudio & Aprendizaje*, *Bienestar & Mente*, *Finanzas*, *Creatividad*, *Personal*) o crea categorías personalizadas.
- Barra de filtros por chips en la pantalla principal con conteo dinámico de actividades.

### 🎨 5. Sistema de 3 Temas & Tipografía Moderna
- **🌙 Oscuro (Default):** Grafito profundo con toques violetas (`#121317`).
- **☀️ Claro:** Slate e índigo fresco (`#f8f9fb`).
- **🔥 Cálido:** Arena y terracota suave (`#f5efe6`).
- **Tipografía:** *Manrope* para textos y UI + *Space Mono* para métricas y números.
- **Iconografía 100% Vectorial:** Más de 28 iconos curados de [Lucide React](https://lucide.dev/).

### ⚡ 6. Arquitectura Local-First & PWA
- **100% Offline:** Tus datos se guardan en el almacenamiento local del dispositivo sin depender de servidores.
- **Respaldo y Portabilidad:** Exportación e importación completa de tu historial en formato JSON con 1 clic.
- **Instalable como PWA:** Agrega Trackr a la pantalla de inicio de tu teléfono o escritorio.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework** | [React 18](https://reactjs.org/) con [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 5](https://vitejs.dev/) |
| **Estado Global** | [Zustand](https://github.com/pmndrs/zustand) |
| **Estilos** | CSS Modules + Custom Properties / Design Tokens (`tokens.css`) |
| **Iconos** | [Lucide React](https://lucide.dev/) |
| **Efectos** | [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Fechas & Métricas** | Utilidades nativas (`dateUtils`, `streakCalculator`, `heatmapCalculator`) |

---

## 📁 Estructura del Proyecto

```text
src/
├── app/
│   ├── HomeView/                      # Dashboard principal (Heatmap global, lista y filtros)
│   └── HabitDetailView/               # Vista profunda de hábito (Gráficos, calendario y metas)
├── core/
│   ├── theme/                         # Tokens CSS (colores, fuentes, radios) y useThemeStore
│   ├── types/                         # Modelos TypeScript (Habit, DailyActivityLog, etc.)
│   ├── ui/                            # Componentes atómicos (Button, Modal, HabitIcon, etc.)
│   └── utils/                         # Utilidades de fechas ISO y formato
├── features/
│   ├── habits/                        # HabitCard, HabitList, HabitFormModal, useHabitsStore
│   ├── heatmap/                       # GlobalHeatmap, MonthlyGrid, AnnualHeatmap
│   ├── logging/                       # QuickLogBottomSheet, useLogsStore
│   ├── settings/                      # SettingsModal (Exportar/Importar JSON, Reset)
│   └── stats/                         # ConsistencyOverview, HabitStatBadges, HabitEvolutionChart, PeriodicGoalCards
└── services/
    └── storage/                       # Adaptadores de almacenamiento Local-First y Mock Data
```

---

## 🚀 Inicio Rápido

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior)
- `npm` o `pnpm` o `yarn`

### Instalación y Ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/EricSandGit/Trackr.git
   cd Trackr
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

4. **Compilar para producción:**
   ```bash
   npm run build
   npm run preview
   ```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
