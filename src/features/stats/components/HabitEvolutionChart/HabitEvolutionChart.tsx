import React, { useState, useMemo } from 'react';
import { TrendingUp, Sparkles, Target } from 'lucide-react';
import { Habit, DailyActivityLog } from '@/core/types';
import {
  formatDateToISO,
  shiftDate,
  parseISODate,
  getRelativeDateLabel,
} from '@/core/utils/dateUtils';
import styles from './HabitEvolutionChart.module.css';

type TimeRange = '14d' | '30d' | '90d' | 'all';

export interface HabitEvolutionChartProps {
  habit: Habit;
  logs: DailyActivityLog[];
  onSelectDate?: (date: string) => void;
}

interface ChartDataPoint {
  date: string;
  label: string;
  fullDateLabel: string;
  value: number;
  isRecord: boolean;
  isCompleted: boolean;
  x: number;
  y: number;
}

export const HabitEvolutionChart: React.FC<HabitEvolutionChartProps> = ({
  habit,
  logs,
  onSelectDate,
}) => {
  const [range, setRange] = useState<TimeRange>('30d');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const unit = habit.unit || 'uds';
  const goal = habit.dailyGoal || 0;
  const habitLogs = useMemo(() => logs.filter((l) => l.habitId === habit.id), [logs, habit.id]);

  // Determine days count based on range
  const daysCount = useMemo(() => {
    switch (range) {
      case '14d':
        return 14;
      case '30d':
        return 30;
      case '90d':
        return 90;
      case 'all':
        return 180;
    }
  }, [range]);

  // Generate series
  const { points, yTicks, goalY } = useMemo(() => {
    const todayStr = formatDateToISO(new Date());
    const rawPoints: Array<{
      date: string;
      label: string;
      fullDateLabel: string;
      value: number;
      isRecord: boolean;
      isCompleted: boolean;
    }> = [];

    let highestVal = 0;

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = shiftDate(todayStr, -i);
      const log = habitLogs.find((l) => l.date === d);
      const val = log?.totalValue || 0;
      const isRecord = !!log?.isPersonalRecord;
      const isCompleted = !!log?.isCompleted;

      if (val > highestVal) highestVal = val;

      const dateObj = parseISODate(d);
      const label = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      const fullDateLabel = getRelativeDateLabel(d, 'short');

      rawPoints.push({
        date: d,
        label,
        fullDateLabel,
        value: val,
        isRecord,
        isCompleted,
      });
    }

    // Chart dimensions with ample headroom for the elevated cartelito
    const width = 520;
    const height = 230;
    const paddingLeft = 42;
    const paddingRight = 18;
    const paddingTop = 50; // Headroom for cartelito + stem line
    const paddingBottom = 32;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const maxScaleValue = Math.max(highestVal, goal, 5);
    const calculatedMaxY = Math.ceil(maxScaleValue * 1.15);

    // Compute coordinates for each point
    const calculatedPoints: ChartDataPoint[] = rawPoints.map((p, idx) => {
      const x = paddingLeft + (idx / Math.max(1, rawPoints.length - 1)) * plotWidth;
      const y = paddingTop + plotHeight - (p.value / calculatedMaxY) * plotHeight;
      return {
        ...p,
        x,
        y,
      };
    });

    // Generate 4 horizontal ticks for Y-axis
    const ticksCount = 4;
    const ticks: Array<{ value: number; y: number }> = [];
    for (let i = 0; i <= ticksCount; i++) {
      const val = Math.round((calculatedMaxY / ticksCount) * i);
      const y = paddingTop + plotHeight - (val / calculatedMaxY) * plotHeight;
      ticks.push({ value: val, y });
    }

    const calculatedGoalY = goal > 0
      ? paddingTop + plotHeight - (goal / calculatedMaxY) * plotHeight
      : null;

    return {
      points: calculatedPoints,
      yTicks: ticks,
      goalY: calculatedGoalY,
    };
  }, [daysCount, habitLogs, goal]);

  // Construct SVG Path (D line) and Area Path
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: '', areaPath: '' };

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }

    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const bottomY = 230 - 32; // height - paddingBottom = 198
    const area = `${d} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

    return { linePath: d, areaPath: area };
  }, [points]);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedPointIndex;
  const activePoint = activeIndex !== null && points[activeIndex] ? points[activeIndex] : null;

  const gradientId = `chartGrad_${habit.id}`;
  const habitColor = habit.color || '#38bdf8';

  // Step for showing X-axis labels to avoid text overlapping
  const xLabelStep = Math.ceil(points.length / 6);

  return (
    <div className={styles.container}>
      {/* Header with Title & Range Switcher */}
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <TrendingUp size={16} color={habitColor} />
          <h4 className={styles.title}>Evolución Diaria de Cantidad</h4>
        </div>

        <div className={styles.rangeSelector}>
          <button
            type="button"
            className={`${styles.rangeBtn} ${range === '14d' ? styles.rangeBtnActive : ''}`}
            onClick={() => {
              setRange('14d');
              setSelectedPointIndex(null);
              setHoveredIndex(null);
            }}
          >
            14d
          </button>
          <button
            type="button"
            className={`${styles.rangeBtn} ${range === '30d' ? styles.rangeBtnActive : ''}`}
            onClick={() => {
              setRange('30d');
              setSelectedPointIndex(null);
              setHoveredIndex(null);
            }}
          >
            30d
          </button>
          <button
            type="button"
            className={`${styles.rangeBtn} ${range === '90d' ? styles.rangeBtnActive : ''}`}
            onClick={() => {
              setRange('90d');
              setSelectedPointIndex(null);
              setHoveredIndex(null);
            }}
          >
            90d
          </button>
          <button
            type="button"
            className={`${styles.rangeBtn} ${range === 'all' ? styles.rangeBtnActive : ''}`}
            onClick={() => {
              setRange('all');
              setSelectedPointIndex(null);
              setHoveredIndex(null);
            }}
          >
            Todo
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className={styles.chartArea}>
        <svg viewBox="0 0 520 230" className={styles.svgChart}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={habitColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={habitColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y-axis labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1="42"
                y1={tick.y}
                x2="502"
                y2={tick.y}
                className={styles.gridLine}
              />
              <text x="36" y={tick.y + 3} textAnchor="end" className={styles.axisText}>
                {tick.value}
              </text>
            </g>
          ))}

          {/* Goal reference dashed line */}
          {goalY !== null && (
            <g>
              <line
                x1="42"
                y1={goalY}
                x2="502"
                y2={goalY}
                className={styles.goalLine}
              />
              <text
                x="500"
                y={goalY - 4}
                textAnchor="end"
                style={{ fill: 'var(--tk-text-muted)', fontSize: '9px', fontWeight: 600 }}
              >
                Meta: {goal} {unit}
              </text>
            </g>
          )}

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Evolution Line */}
          <path
            d={linePath}
            className={styles.chartLine}
            stroke={habitColor}
          />

          {/* Vertical Guide Line going down to the axis */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={activePoint.y + 6}
              x2={activePoint.x}
              y2={198}
              className={styles.hoverGuideLine}
            />
          )}

          {/* Upward Stem Line connecting the circle directly to the floating Cartelito */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={activePoint.y - 6}
              x2={activePoint.x}
              y2={Math.max(34, activePoint.y - 20)}
              stroke={habitColor}
              className={styles.stemLine}
            />
          )}

          {/* Interactive Data Points */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            const isSelected = selectedPointIndex === idx;
            const isHighlighted = isHovered || isSelected;
            const pointRadius = isHighlighted ? 6.5 : p.isRecord ? 5 : (daysCount > 30 ? 3 : 4);

            return (
              <g key={p.date}>
                {/* Larger touch/hover capture area */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="14"
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    setSelectedPointIndex(idx);
                    onSelectDate?.(p.date);
                  }}
                />

                {/* Visible Data Point Circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={pointRadius}
                  fill={p.value > 0 ? (isHighlighted ? '#ffffff' : habitColor) : 'var(--tk-bg-surface-elevated)'}
                  stroke={p.isRecord ? 'var(--tk-record-gold)' : isHighlighted ? '#ffffff' : habitColor}
                  strokeWidth={p.isRecord ? 2 : 1.5}
                  className={`${styles.dataPoint} ${p.isRecord ? styles.recordPoint : ''} ${
                    isHighlighted ? styles.activePointIndicator : ''
                  }`}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    setSelectedPointIndex(idx);
                    onSelectDate?.(p.date);
                  }}
                />

                {/* X-axis date labels */}
                {(idx % xLabelStep === 0 || idx === points.length - 1) && (
                  <text
                    x={p.x}
                    y="216"
                    textAnchor="middle"
                    className={styles.axisText}
                  >
                    {p.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Elevated Floating Cartelito above the stem line */}
          {activePoint && (
            <g
              className={styles.floatingTooltipGroup}
              transform={`translate(${Math.max(48, Math.min(472, activePoint.x))}, ${Math.max(34, activePoint.y - 20)})`}
            >
              {/* Tooltip Background Box */}
              <rect
                x="-48"
                y="-26"
                width="96"
                height="24"
                className={styles.tooltipBackground}
                style={{ stroke: habitColor }}
              />

              {/* Tooltip Connector Notch */}
              <polygon
                points="-5,-2 5,-2 0,3"
                fill="#161b22"
                stroke={habitColor}
                strokeWidth="1"
              />

              {/* Text inside Cartelito */}
              <text x="0" y="-10" className={styles.tooltipDateText}>
                {activePoint.fullDateLabel} • <tspan fill={habitColor}>{activePoint.value}{unit ? unit[0] : ''}</tspan>
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Selected Point Detail Card on Click */}
      {activePoint ? (
        <div className={styles.selectedPointInfo}>
          <div>
            <span className={styles.selectedPointDate}>
              📅 {getRelativeDateLabel(activePoint.date, 'long')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activePoint.isRecord && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--tk-record-gold)',
                  backgroundColor: 'rgba(251, 191, 36, 0.15)',
                  padding: '2px 6px',
                  borderRadius: 'var(--tk-radius-full)',
                }}
              >
                <Sparkles size={11} /> ¡Récord!
              </span>
            )}

            {goal > 0 && activePoint.value >= goal && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--tk-accent)',
                }}
              >
                <Target size={11} /> Meta cumplida
              </span>
            )}

            <span className={styles.selectedPointValue} style={{ color: habitColor }}>
              {activePoint.value} {unit}
            </span>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '11px', color: 'var(--tk-text-muted)', textAlign: 'center' }}>
          Pasa el cursor o toca cualquier punto del gráfico para ver el cartelito con la fecha exacta.
        </div>
      )}
    </div>
  );
};
