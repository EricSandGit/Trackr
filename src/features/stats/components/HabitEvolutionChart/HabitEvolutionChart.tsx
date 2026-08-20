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

export type TimeRange = 'month' | 'year' | 'all';

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
  const [range, setRange] = useState<TimeRange>('month');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const unit = habit.unit || 'uds';
  const goal = habit.dailyGoal || 0;
  const habitLogs = useMemo(() => logs.filter((l) => l.habitId === habit.id), [logs, habit.id]);

  const todayStr = useMemo(() => formatDateToISO(new Date()), []);

  // Determine days count based on range (Mensual = 30d, Anual = 365d, Histórico = Todo)
  const daysCount = useMemo(() => {
    switch (range) {
      case 'month':
        return 30;
      case 'year':
        return 365;
      case 'all': {
        const habitCreationDate = habit.createdAt
          ? formatDateToISO(new Date(habit.createdAt))
          : todayStr;

        let earliestDate = habitCreationDate;
        habitLogs.forEach((l) => {
          if (l.date && l.date < earliestDate) {
            earliestDate = l.date;
          }
        });

        const d1 = parseISODate(earliestDate).getTime();
        const d2 = parseISODate(todayStr).getTime();
        const diffDays = Math.max(30, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
        return diffDays;
      }
    }
  }, [range, habit.createdAt, habitLogs, todayStr]);

  // Generate series and calculations
  const {
    points,
    yTicks,
    goalY,
    avgY,
    periodAverage,
    highestVal,
  } = useMemo(() => {
    const rawPoints: Array<{
      date: string;
      label: string;
      fullDateLabel: string;
      value: number;
      isRecord: boolean;
      isCompleted: boolean;
    }> = [];

    let highest = 0;
    let totalVolume = 0;

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = shiftDate(todayStr, -i);
      const log = habitLogs.find((l) => l.date === d);
      const val = log?.totalValue || 0;
      const isRecord = !!log?.isPersonalRecord;
      const isCompleted = !!log?.isCompleted;

      if (val > highest) highest = val;
      totalVolume += val;

      const dateObj = parseISODate(d);
      const label = range === 'year' || (range === 'all' && daysCount > 90)
        ? dateObj.toLocaleDateString('es-ES', { month: 'short' })
        : dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
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

    const calculatedAvg = rawPoints.length > 0 ? totalVolume / rawPoints.length : 0;

    // Chart dimensions with dedicated right-side space for labels
    const width = 560;
    const height = 230;
    const paddingLeft = 38;
    const paddingRight = 86;
    const paddingTop = 50; // Headroom for cartelito + stem line
    const paddingBottom = 32;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const maxScaleValue = Math.max(highest, goal, calculatedAvg, 5);
    const calculatedMaxY = Math.ceil(maxScaleValue * 1.18);

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

    const calculatedAvgY = calculatedAvg > 0
      ? paddingTop + plotHeight - (calculatedAvg / calculatedMaxY) * plotHeight
      : null;

    return {
      points: calculatedPoints,
      yTicks: ticks,
      goalY: calculatedGoalY,
      avgY: calculatedAvgY,
      periodAverage: calculatedAvg,
      highestVal: highest,
    };
  }, [daysCount, habitLogs, goal, range, todayStr]);

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
  const xLabelStep = useMemo(() => {
    if (range === 'month') return 5;
    if (range === 'year') return Math.max(1, Math.round(points.length / 12));
    return Math.max(1, Math.round(points.length / 8));
  }, [range, points.length]);

  // Determine bar width for histogram
  const barWidth = useMemo(() => {
    if (points.length <= 30) return 7;
    if (points.length <= 90) return 4;
    if (points.length <= 180) return 2.5;
    return 1.5;
  }, [points.length]);

  // Avoid vertical collision for side labels if goal and average are at similar height
  const { displayGoalY, displayAvgY } = useMemo(() => {
    let gY = goalY;
    let aY = avgY;
    if (goalY !== null && avgY !== null && Math.abs(goalY - avgY) < 14) {
      if (goalY < avgY) {
        gY = goalY - 6;
        aY = avgY + 6;
      } else {
        gY = goalY + 6;
        aY = avgY - 6;
      }
    }
    return { displayGoalY: gY, displayAvgY: aY };
  }, [goalY, avgY]);

  return (
    <div className={styles.container}>
      {/* Header with Title & Range Switcher (Mensual / Anual / Histórico) */}
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <TrendingUp size={16} color={habitColor} />
          <h4 className={styles.title}>Evolución e Histograma</h4>
        </div>

        <div className={styles.rangeSelector}>
          <button
            type="button"
            className={`${styles.rangeBtn} ${range === 'month' ? styles.rangeBtnActive : ''}`}
            onClick={() => {
              setRange('month');
              setSelectedPointIndex(null);
              setHoveredIndex(null);
            }}
          >
            Mensual
          </button>
          <button
            type="button"
            className={`${styles.rangeBtn} ${range === 'year' ? styles.rangeBtnActive : ''}`}
            onClick={() => {
              setRange('year');
              setSelectedPointIndex(null);
              setHoveredIndex(null);
            }}
          >
            Anual
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
            Histórico
          </button>
        </div>
      </div>

      {/* Legend with Metrics Summary */}
      <div className={styles.statsLegend}>
        {goal > 0 && (
          <div className={styles.legendItem}>
            <div className={styles.legendLineGoal} />
            <span>Meta: <strong>{goal} {unit}</strong></span>
          </div>
        )}
        {periodAverage > 0 && (
          <div className={styles.legendItem}>
            <div className={styles.legendLineAvg} />
            <span>Promedio: <strong>{periodAverage.toFixed(1)} {unit}/día</strong></span>
          </div>
        )}
        {highestVal > 0 && (
          <div className={styles.legendItem} style={{ marginLeft: 'auto' }}>
            <Sparkles size={12} color="var(--tk-record-gold)" />
            <span>Máx: <strong style={{ color: 'var(--tk-record-gold)' }}>{highestVal} {unit}</strong></span>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div className={styles.chartArea}>
        <svg viewBox="0 0 560 230" className={styles.svgChart}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={habitColor} stopOpacity="0.30" />
              <stop offset="100%" stopColor={habitColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y-axis labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1="38"
                y1={tick.y}
                x2="474"
                y2={tick.y}
                className={styles.gridLine}
              />
              <text x="32" y={tick.y + 3} textAnchor="end" className={styles.axisText}>
                {tick.value}
              </text>
            </g>
          ))}

          {/* Goal reference line with side label */}
          {goalY !== null && displayGoalY !== null && (
            <g>
              <line
                x1="38"
                y1={goalY}
                x2="478"
                y2={goalY}
                className={styles.goalLine}
              />
              <text
                x="484"
                y={displayGoalY + 3.5}
                textAnchor="start"
                className={styles.sideGoalText}
              >
                Meta: {goal} {unit}
              </text>
            </g>
          )}

          {/* Average reference line with side label */}
          {avgY !== null && displayAvgY !== null && periodAverage > 0 && (
            <g>
              <line
                x1="38"
                y1={avgY}
                x2="478"
                y2={avgY}
                className={styles.averageLine}
              />
              <text
                x="484"
                y={displayAvgY + 3.5}
                textAnchor="start"
                className={styles.sideAvgText}
              >
                Prom: {periodAverage.toFixed(1)} {unit}
              </text>
            </g>
          )}

          {/* Histogram Bars */}
          {points.map((p, idx) => {
            if (p.value <= 0) return null;
            const barHeight = Math.max(2, 198 - p.y);
            const isHovered = hoveredIndex === idx;
            const isSelected = selectedPointIndex === idx;
            const isHighlighted = isHovered || isSelected;

            return (
              <rect
                key={`bar-${p.date}`}
                x={p.x - barWidth / 2}
                y={p.y}
                width={barWidth}
                height={barHeight}
                rx={barWidth > 3 ? 1.5 : 0.5}
                fill={habitColor}
                opacity={isHighlighted ? 0.85 : 0.28}
                className={styles.histogramBar}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  setSelectedPointIndex(idx);
                  onSelectDate?.(p.date);
                }}
              />
            );
          })}

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
            const pointRadius = isHighlighted ? 6.5 : p.isRecord ? 5 : (points.length > 45 ? 2 : 3.5);

            return (
              <g key={p.date}>
                {/* Larger touch/hover capture area */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={points.length > 45 ? 8 : 14}
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
              transform={`translate(${Math.max(48, Math.min(436, activePoint.x))}, ${Math.max(34, activePoint.y - 20)})`}
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
                fill="var(--tk-bg-surface-elevated)"
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
          Toca o pasa el cursor por cualquier barra o punto para ver el cartelito flotante y el valor exacto.
        </div>
      )}
    </div>
  );
};
