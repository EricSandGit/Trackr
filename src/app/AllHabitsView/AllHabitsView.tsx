import React, { useState, useMemo } from 'react';
import {
  Plus,
  Settings,
  Search,
  Layers,
  ArrowUpDown,
  Calendar,
  Flame,
  TrendingUp,
  Clock,
  Archive,
  Sparkles,
  ChevronRight,
  X,
  Tag,
  CheckCircle2,
  CalendarDays,
  ShieldAlert,
  Activity,
  SlidersHorizontal,
} from 'lucide-react';
import { Habit, HabitType, CURATED_HABIT_CATEGORIES } from '@/core/types';
import { useHabitsStore } from '@/features/habits';
import { useLogsStore } from '@/features/logging';
import { useI18nStore } from '@/core/i18n';
import { UserAccountButton } from '@/features/auth';
import { HabitIcon } from '@/core/ui/HabitIcon';
import { Button } from '@/core/ui/Button';
import { calculateHabitIndividualStats } from '@/features/stats/logic/streakCalculator';
import { isHabitScheduledOnDate } from '@/features/heatmap/logic/heatmapCalculator';
import styles from './AllHabitsView.module.css';

const HabitFormModal = React.lazy(() =>
  import('@/features/habits').then((m) => ({ default: m.HabitFormModal }))
);
const SettingsModal = React.lazy(() =>
  import('@/features/settings').then((m) => ({ default: m.SettingsModal }))
);

export interface AllHabitsViewProps {
  onOpenHabitDetail: (habit: Habit) => void;
  onSwitchToDailyView: () => void;
}

type SortOption =
  | 'newest'
  | 'oldest'
  | 'consistency_high'
  | 'consistency_low'
  | 'streak_high'
  | 'name_asc';

type StatusFilter = 'all' | 'active' | 'archived';

export const AllHabitsView: React.FC<AllHabitsViewProps> = ({
  onOpenHabitDetail,
  onSwitchToDailyView,
}) => {
  const { habits, loadHabits, createHabit } = useHabitsStore();
  const { logs, selectedDate, loadLogs } = useLogsStore();
  const { t, language } = useI18nStore();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleDataResetOrImported = async () => {
    await loadHabits();
    await loadLogs();
  };

  // Filter expansion & search state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | HabitType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Count non-default active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (sortBy !== 'newest') count++;
    return count;
  }, [statusFilter, typeFilter, categoryFilter, sortBy]);

  // Compute stats for all habits
  const habitsWithStats = useMemo(() => {
    const now = Date.now();
    return habits.map((habit) => {
      const stats = calculateHabitIndividualStats(habit, logs);
      const createdTime = new Date(habit.createdAt).getTime();
      const daysSinceCreated = Math.max(
        0,
        Math.floor((now - (isNaN(createdTime) ? now : createdTime)) / (1000 * 60 * 60 * 24))
      );
      const isScheduledToday = isHabitScheduledOnDate(habit, selectedDate);
      const createdDateFormatted = isNaN(createdTime)
        ? habit.createdAt
        : new Date(createdTime).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

      return {
        habit,
        stats,
        daysSinceCreated,
        isScheduledToday,
        createdDateFormatted,
      };
    });
  }, [habits, logs, selectedDate, language]);

  // Extract unique categories and counts
  const categoriesWithCounts = useMemo(() => {
    const countsMap = new Map<string, number>();
    habits.forEach((h) => {
      if (h.category) {
        countsMap.set(h.category, (countsMap.get(h.category) || 0) + 1);
      }
    });

    const list: Array<{ name: string; count: number; icon: string }> = [];
    countsMap.forEach((count, name) => {
      const curated = CURATED_HABIT_CATEGORIES.find(
        (c) => c.id === name || c.label.toLowerCase() === name.toLowerCase()
      );
      list.push({
        name,
        count,
        icon: curated ? curated.icon : 'Tag',
      });
    });

    return list.sort((a, b) => b.count - a.count);
  }, [habits]);

  // Counts by status
  const activeCount = useMemo(() => habits.filter((h) => !h.isArchived).length, [habits]);
  const archivedCount = useMemo(() => habits.filter((h) => h.isArchived).length, [habits]);

  // Filtered and sorted list
  const filteredAndSortedHabits = useMemo(() => {
    return habitsWithStats
      .filter((item) => {
        // Status filter
        if (statusFilter === 'active' && item.habit.isArchived) return false;
        if (statusFilter === 'archived' && !item.habit.isArchived) return false;

        // Category filter
        if (categoryFilter !== 'all' && item.habit.category !== categoryFilter) return false;

        // Type filter
        if (typeFilter !== 'all' && item.habit.type !== typeFilter) return false;

        // Search text query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = item.habit.name.toLowerCase().includes(q);
          const matchDesc = item.habit.description?.toLowerCase().includes(q);
          const matchCat = item.habit.category?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest': {
            const timeA = new Date(a.habit.createdAt).getTime() || 0;
            const timeB = new Date(b.habit.createdAt).getTime() || 0;
            return timeB - timeA;
          }
          case 'oldest': {
            const timeA = new Date(a.habit.createdAt).getTime() || 0;
            const timeB = new Date(b.habit.createdAt).getTime() || 0;
            return timeA - timeB;
          }
          case 'consistency_high': {
            if (b.stats.completionRateLast30Days !== a.stats.completionRateLast30Days) {
              return b.stats.completionRateLast30Days - a.stats.completionRateLast30Days;
            }
            return b.stats.currentStreak - a.stats.currentStreak;
          }
          case 'consistency_low': {
            if (a.stats.completionRateLast30Days !== b.stats.completionRateLast30Days) {
              return a.stats.completionRateLast30Days - b.stats.completionRateLast30Days;
            }
            return a.stats.currentStreak - b.stats.currentStreak;
          }
          case 'streak_high': {
            if (b.stats.currentStreak !== a.stats.currentStreak) {
              return b.stats.currentStreak - a.stats.currentStreak;
            }
            return b.stats.completionRateLast30Days - a.stats.completionRateLast30Days;
          }
          case 'name_asc': {
            return a.habit.name.localeCompare(b.habit.name);
          }
          default:
            return 0;
        }
      });
  }, [habitsWithStats, statusFilter, categoryFilter, typeFilter, searchQuery, sortBy]);

  const isAnyFilterActive =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    typeFilter !== 'all' ||
    sortBy !== 'newest';

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setTypeFilter('all');
    setSortBy('newest');
  };

  const getFrequencyLabel = (habit: Habit) => {
    if (habit.frequency.type === 'casual') {
      return t('casualActivities.frequencyLabel');
    }
    if (habit.frequency.type === 'everyday') {
      return t('habitDetail.everyday');
    }
    const days = habit.frequency.daysOfWeek || [];
    const dayNames = [
      t('habitForm.daysAbbrev.sun'),
      t('habitForm.daysAbbrev.mon'),
      t('habitForm.daysAbbrev.tue'),
      t('habitForm.daysAbbrev.wed'),
      t('habitForm.daysAbbrev.thu'),
      t('habitForm.daysAbbrev.fri'),
      t('habitForm.daysAbbrev.sat'),
    ];
    const activeDays = days.map((d) => dayNames[d]).join(' · ');
    return activeDays || t('habitDetail.selectedDaysFreq', { count: days.length });
  };

  const getTypeLabel = (habit: Habit) => {
    if (habit.type === 'quantitative') {
      return habit.dailyGoal
        ? `${habit.dailyGoal} ${habit.unit || ''}/${t('stats.week').toLowerCase().slice(0, 1)}`
        : habit.unit || t('allHabits.typeQuantitative');
    }
    if (habit.type === 'avoidance') {
      return t('allHabits.typeAvoidance');
    }
    return t('allHabits.typeBoolean');
  };

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <div className={styles.brandIconDot} style={{ backgroundColor: '#238636' }} />
            <div className={styles.brandIconDot} style={{ backgroundColor: '#39d353' }} />
            <div className={styles.brandIconDot} style={{ backgroundColor: '#0e4429' }} />
            <div className={styles.brandIconDot} style={{ backgroundColor: '#2ea043' }} />
          </div>
          <h1 className={styles.brandTitle}>Trackr</h1>
          <span className={styles.brandCountBadge}>
            {t('allHabits.subtitle', { active: activeCount, archived: archivedCount })}
          </span>
        </div>

        <div className={styles.topActions}>
          <UserAccountButton />

          <button
            className={styles.actionBtn}
            onClick={() => setIsSettingsModalOpen(true)}
            aria-label={t('nav.settings')}
            title={t('nav.settings')}
          >
            <Settings size={18} />
          </button>

          <button
            className={`${styles.actionBtn} ${styles.createBtn}`}
            onClick={() => setIsCreateModalOpen(true)}
            aria-label={t('nav.newHabit')}
            title={t('nav.newHabit')}
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Main Tab Switcher between Daily & All Habits */}
      <div className={styles.viewSwitcher}>
        <button
          type="button"
          className={styles.viewTab}
          onClick={onSwitchToDailyView}
        >
          <CalendarDays size={16} />
          <span>{t('allHabits.navDailyView')}</span>
        </button>

        <button
          type="button"
          className={`${styles.viewTab} ${styles.viewTabActive}`}
        >
          <Layers size={16} />
          <span>{t('allHabits.navAllHabitsView')}</span>
          <span className={styles.viewTabBadge}>{habits.length}</span>
        </button>
      </div>

      {/* Live Search Bar and Filter Toggle Button */}
      <div className={styles.searchBarRow}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('allHabits.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="button"
          className={`${styles.filterToggleBtn} ${isFiltersOpen ? styles.filterToggleBtnOpen : ''} ${activeFiltersCount > 0 ? styles.filterToggleBtnActive : ''}`}
          onClick={() => setIsFiltersOpen((prev) => !prev)}
          aria-expanded={isFiltersOpen}
          title={isFiltersOpen ? t('allHabits.hideFilters') : t('allHabits.showFilters')}
        >
          <SlidersHorizontal size={15} />
          <span>{t('allHabits.filterButton')}</span>
          {activeFiltersCount > 0 && (
            <span className={styles.activeFilterCountBadge}>{activeFiltersCount}</span>
          )}
        </button>
      </div>

      {/* Filter and Sorting Control Panel (Collapsible) */}
      {isFiltersOpen && (
        <div className={styles.filterControls}>
          {/* Status Filter Row */}
          <div className={styles.statusPills}>
            <button
              type="button"
              className={`${styles.statusPill} ${statusFilter === 'all' ? styles.statusPillActive : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              {t('allHabits.statusAll')} ({habits.length})
            </button>
            <button
              type="button"
              className={`${styles.statusPill} ${statusFilter === 'active' ? styles.statusPillActive : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              {t('allHabits.statusActive')} ({activeCount})
            </button>
            <button
              type="button"
              className={`${styles.statusPill} ${statusFilter === 'archived' ? styles.statusPillActive : ''}`}
              onClick={() => setStatusFilter('archived')}
            >
              {t('allHabits.statusArchived')} ({archivedCount})
            </button>
          </div>

          {/* Row 2: Measurement Type Selector (Alineado al Centro) */}
          <div className={styles.typeSelectorRow}>
            <div className={styles.typePills}>
              <button
                type="button"
                className={`${styles.typePill} ${typeFilter === 'all' ? styles.typePillActive : ''}`}
                onClick={() => setTypeFilter('all')}
                title={t('allHabits.typeAll')}
              >
                <span>{t('allHabits.typeAll')}</span>
              </button>
              <button
                type="button"
                className={`${styles.typePill} ${typeFilter === 'boolean' ? styles.typePillActive : ''}`}
                onClick={() => setTypeFilter('boolean')}
                title={t('allHabits.typeBoolean')}
              >
                <CheckCircle2 size={12} />
                <span>{t('allHabits.typeBoolean')}</span>
              </button>
              <button
                type="button"
                className={`${styles.typePill} ${typeFilter === 'quantitative' ? styles.typePillActive : ''}`}
                onClick={() => setTypeFilter('quantitative')}
                title={t('allHabits.typeQuantitative')}
              >
                <Activity size={12} />
                <span>{t('allHabits.typeQuantitative')}</span>
              </button>
              <button
                type="button"
                className={`${styles.typePill} ${typeFilter === 'avoidance' ? styles.typePillActive : ''}`}
                onClick={() => setTypeFilter('avoidance')}
                title={t('allHabits.typeAvoidance')}
              >
                <ShieldAlert size={12} color="var(--tk-warning)" />
                <span>{t('allHabits.typeAvoidance')}</span>
              </button>
            </div>
          </div>

          {/* Row 3: Comboboxes Simétricos (Filtro de Etiquetas & Selector de Orden) */}
          <div className={styles.comboboxRow}>
            {/* Etiquetas / Categorías Combobox */}
            <div className={styles.comboboxWrapper}>
              <Tag size={14} color="var(--tk-text-muted)" style={{ flexShrink: 0 }} />
              <select
                className={styles.comboboxSelect}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label={t('allHabits.allCategories')}
              >
                <option value="all">
                  {t('allHabits.allCategories')} ({habits.length})
                </option>
                {categoriesWithCounts.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector Combobox */}
            <div className={styles.comboboxWrapper}>
              <ArrowUpDown size={14} color="var(--tk-text-muted)" style={{ flexShrink: 0 }} />
              <select
                className={styles.comboboxSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label={t('allHabits.sortLabel')}
              >
                <option value="newest">📅 {t('allHabits.sortNewest')}</option>
                <option value="oldest">⏳ {t('allHabits.sortOldest')}</option>
                <option value="consistency_high">📈 {t('allHabits.sortConsistencyHigh')}</option>
                <option value="consistency_low">📉 {t('allHabits.sortConsistencyLow')}</option>
                <option value="streak_high">🔥 {t('allHabits.sortStreakHigh')}</option>
                <option value="name_asc">🔤 {t('allHabits.sortAlphabetical')}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results summary and clear filters */}
      <div className={styles.resultsSummary}>
        <span>
          {t('allHabits.showingCount', {
            count: filteredAndSortedHabits.length,
            total: habits.length,
          })}
        </span>

        {isAnyFilterActive && (
          <button
            type="button"
            className={styles.clearFiltersBtn}
            onClick={handleClearFilters}
          >
            <X size={13} />
            <span>{t('allHabits.clearFilters')}</span>
          </button>
        )}
      </div>

      {/* Habits Catalog List */}
      {habits.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Sparkles size={28} color="var(--tk-accent)" />
          </div>
          <h3 className={styles.emptyTitle}>{t('allHabits.noHabitsCreated')}</h3>
          <p className={styles.emptyText}>{t('allHabits.noHabitsCreatedDesc')}</p>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t('home.createHabit')}
          </Button>
        </div>
      ) : filteredAndSortedHabits.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Search size={28} color="var(--tk-text-muted)" />
          </div>
          <h3 className={styles.emptyTitle}>{t('allHabits.noHabitsFound')}</h3>
          <p className={styles.emptyText}>{t('allHabits.noHabitsFoundDesc')}</p>
          <Button variant="secondary" size="sm" onClick={handleClearFilters}>
            {t('allHabits.clearFilters')}
          </Button>
        </div>
      ) : (
        <div className={styles.habitsList}>
          {filteredAndSortedHabits.map((item) => {
            const { habit, stats, daysSinceCreated, isScheduledToday, createdDateFormatted } = item;
            const isAvoidance = habit.type === 'avoidance';
            const consistencyRate = stats.completionRateLast30Days;
            const consistencyClass =
              consistencyRate >= 80
                ? styles.statValueSuccess
                : consistencyRate >= 50
                ? styles.statValueWarning
                : styles.statValueDanger;

            return (
              <div
                key={habit.id}
                className={`${styles.catalogCard} ${habit.isArchived ? styles.catalogCardArchived : ''}`}
                onClick={() => onOpenHabitDetail(habit)}
              >
                {/* Left Colored Stripe */}
                <div className={styles.colorIndicator} style={{ backgroundColor: habit.color }} />

                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <HabitIcon name={habit.icon} size={22} color={habit.color} />
                  </div>

                  <div className={styles.cardInfo}>
                    <div className={styles.nameRow}>
                      <span className={styles.habitName}>{habit.name}</span>
                      {habit.isArchived && (
                        <span className={styles.archivedPill}>
                          <Archive size={10} style={{ display: 'inline', marginRight: 2 }} />
                          {t('allHabits.archivedBadge')}
                        </span>
                      )}
                      {habit.category && (
                        <span className={styles.categoryPill}>
                          <Tag size={10} />
                          {habit.category}
                        </span>
                      )}
                    </div>

                    {habit.description && (
                      <p className={styles.description}>{habit.description}</p>
                    )}

                    <div className={styles.tagsRow}>
                      <span className={styles.typeBadge}>{getTypeLabel(habit)}</span>
                      <span className={styles.freqBadge}>
                        <Calendar size={11} />
                        {getFrequencyLabel(habit)}
                      </span>
                      {!habit.isArchived && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: isScheduledToday ? '#39d353' : 'var(--tk-text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          {isScheduledToday ? '• ' + t('allHabits.activeToday') : '• ' + t('allHabits.notScheduledToday')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metrics and Performance Grid */}
                <div className={styles.statsRow}>
                  {/* Constancia 30 días */}
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>{t('badges.completionRate30d')}</span>
                    <span className={`${styles.statValue} ${consistencyClass}`}>
                      <TrendingUp size={13} />
                      {consistencyRate}%
                    </span>
                  </div>

                  {/* Racha Actual */}
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>{t('badges.currentStreak')}</span>
                    <span className={styles.statValue}>
                      <Flame size={13} color="var(--tk-warning)" />
                      {stats.currentStreak} {t('common.days')}
                    </span>
                  </div>

                  {/* Antigüedad */}
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>{t('allHabits.sortOldest')}</span>
                    <span className={styles.statValue}>
                      <Clock size={13} color="var(--tk-text-muted)" />
                      {daysSinceCreated === 0
                        ? t('allHabits.createdToday')
                        : `${daysSinceCreated} ${t('common.days')}`}
                    </span>
                  </div>

                  {/* Total acumulado / días logueados */}
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>{t('badges.totalLifetime')}</span>
                    <span className={styles.statValue}>
                      {isAvoidance ? (
                        <>🛡️ {stats.totalLifetimeEntries} {t('common.days')}</>
                      ) : habit.type === 'quantitative' ? (
                        <>{stats.totalLifetimeVolume} {habit.unit || ''}</>
                      ) : (
                        <>{stats.totalLifetimeEntries} {t('common.days')}</>
                      )}
                    </span>
                  </div>
                </div>

                {/* Card Footer with Created Date & Action link */}
                <div className={styles.cardFooter}>
                  <span className={styles.createdText}>
                    <Calendar size={12} />
                    {t('allHabits.createdDate', { date: createdDateFormatted })}
                  </span>

                  <span className={styles.detailAction}>
                    {t('allHabits.viewHabitDetails')}
                    <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Habit Modal */}
      {isCreateModalOpen && (
        <React.Suspense fallback={null}>
          <HabitFormModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={async (input) => {
              await createHabit(input as any);
            }}
          />
        </React.Suspense>
      )}

      {/* Settings & Backup Modal */}
      {isSettingsModalOpen && (
        <React.Suspense fallback={null}>
          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            onDataResetOrImported={handleDataResetOrImported}
          />
        </React.Suspense>
      )}
    </div>
  );
};
