# Trackr — Especificación de Requisitos y Arquitectura Funcional

## 1. Visión General del Producto

**Trackr** es una aplicación móvil web progresiva (PWA Mobile-First) diseñada para el seguimiento visual de hábitos y actividades personales mediante matrices de contribución / calor (*Heatmaps*) inspiradas en la estética de commits de GitHub.

### Propuesta de Valor Central
* **Visualización de Volumen Real:** No solo registra si hiciste o no una actividad, sino **cuánto** hiciste con intensidades de color y reconocimiento de **récords personales**.
* **Visión Global y Detallada:** Un cuadro combinado en el Home que resume la constancia general, más vistas individuales por hábito con calendarios mensuales y mapas anuales expandibles.
* **Cero Fricción:** Funciona 100% offline de inmediato mediante arquitectura *Local-First*, con capacidad de respaldo y sincronización híbrida opcional.

---

## 2. Arquitectura Técnica & Decisiones de Diseño

| Componente | Elección Técnica | Justificación |
| :--- | :--- | :--- |
| **Plataforma** | **PWA Mobile-First (React + Vite + TS)** | Instalable en pantalla de inicio de iOS/Android, fluidez nativa táctil, sin pasar por App Stores. |
| **Estilos & UI** | **Vanilla CSS + CSS Variables (Design Tokens)** | Control milimétrico de animaciones, efectos de resplandor, matrices de píxeles y paletas personalizables. |
| **Persistencia** | **Local-First (IndexedDB / LocalStorage)** | Carga instantánea, privacidad absoluta, offline total sin depender de conexión. |
| **Sincronización** | **Híbrida Opcional** | Inicio inmediato sin login + opción de exportar JSON y conectar cuenta de respaldo en la nube. |
| **Estética** | **GitHub Dark Theme por defecto** | Fondo oscuro (#0d1117 / #161b22), celdas de calor luminosas, soporte para Modo Claro. |

---

## 3. Modelo de Datos

### 3.1. Entidad: `Habit` (Hábito / Actividad)
```typescript
interface Habit {
  id: string;                      // Identificador único (UUID)
  name: string;                    // Nombre del hábito (ej. "Lectura diaria", "Gimnasio")
  description?: string;            // Descripción o notas del objetivo
  icon?: string;                   // Emoji o icono identificador (ej. "📚", "🏋️")
  color: string;                   // Color base del heatmap (Hex: ej. "#22c55e", "#6366f1")
  
  type: 'boolean' | 'quantitative'; // Tipo de medición
  unit?: string;                   // Unidad de medida si es cuantitativo (ej. "págs", "min", "km")
  dailyGoal?: number;              // Meta diaria sugerida (ej. 30 min, 20 págs)
  
  frequency: {
    type: 'everyday' | 'specific_days';
    daysOfWeek?: number[];         // [1, 2, 3, 4, 5] (0 = Domingo, 1 = Lunes, ...)
  };
  
  isArchived: boolean;             // Para desactivar sin perder el historial
  createdAt: string;               // ISO Timestamp
  updatedAt: string;               // ISO Timestamp
}
```

### 3.2. Entidad: `ActivityLog` (Registro Diario)
```typescript
interface ActivityLogEntry {
  timestamp: string;               // Hora exacta del registro
  value: number;                   // 1 para boolean, o cantidad numérica añadida (ej. +15 min)
  notes?: string;                  // Nota opcional
}

interface DailyActivityLog {
  id: string;                      // ID único (ej: "habitId_YYYY-MM-DD")
  habitId: string;                 // Referencia al hábito
  date: string;                    // Fecha lógica en formato "YYYY-MM-DD"
  totalValue: number;              // Suma total acumulada en ese día
  isCompleted: boolean;            // true si cumplió la meta o si marcó el check
  isPersonalRecord: boolean;       // true si este día batió el récord histórico de volumen
  entries: ActivityLogEntry[];     // Historial de sumas realizadas durante el día
}
```

---

## 4. Lógica de Negocio y Algoritmos Centrales

### 4.1. Cuadro General Combinado del Home (Heatmap Global)
* **Cálculo de Intensidad Diaria:** Porcentaje del total de hábitos activos completados en esa fecha.
* **Escala de Color:** 5 niveles (0% = Apagado/Gris, 1-25% = Nivel 1, 26-50% = Nivel 2, 51-75% = Nivel 3, 76-100% = Nivel 4 brillante).
* **Interactividad:** Tocar cualquier celda abre el detalle de ese día con opción de registrar/editar.

### 4.2. Hábitos Cuantitativos y Detección de Récords
* **Acumulación de Volumen:** Múltiples registros en el mismo día.
* **Nivel de Color Individual:** `min(100%, totalValue / dailyGoal)`.
* **Efecto de Récord Personal:** Si `totalValue > max(historialPrevio)`, la celda se ilumina con un borde dorado/brillante distintivo.

### 4.3. Motor de Constancia y Estadísticas del Home
1. **% de Constancia del Mes:** Días con al menos 1 actividad completada / días transcurridos.
2. **Racha Activa Global:** Conteo continuo de días consecutivos activos.
3. **Total de Actividades Semanales:** Suma de checks/sesiones de la semana.
4. **Hábito Más Constante vs Hábito a Reforzar.**

---

## 5. Arquitectura de Pantallas y Flujos de Usuario

### 5.1. Pantalla Home
1. **Header:** Fecha actual, selector de tema (Oscuro/Claro), botón crear hábito `(+)`, botón ajustes/backup.
2. **Cuadro Global de Actividad:** Matriz estilo GitHub con scroll horizontal.
3. **Resumen de Constancia:** Tarjetas con % mensual, racha global y actividad semanal.
4. **Barra de Navegación de Fecha:** "Hoy", "Ayer" y selector retroactivo.
5. **Lista de Hábitos:** Checkboxes rápidos (simples y bottom-sheet para cuantitativos).

### 5.2. Pantalla Detalle de Hábito
1. **Cabecera & Métricas:** Racha actual, Mayor racha, Récord personal diario, Total acumulado.
2. **Visualizador de Actividad:** Cuadrícula del mes actual + botón para expandir a Heatmap anual completo de 52 semanas.
3. **Acciones:** Editar, Archivar, Eliminar.

### 5.3. Modal de Creación / Edición
* Nombre, descripción, emoji/icono, paleta de color vibrante, tipo (Simple vs Volumen con unidad y meta diaria) y frecuencia semanal.

---

## 6. Onboarding y Datos Iniciales
* 2 hábitos interactivos precargados ("Lectura diaria" cuantitativo y "Ejercicio" simple) con historial simulado inicial listo para probar o editar.
