<template>
  <div class="kds-ticket" :class="[ticketStatusClass, fontSizeClass, `layout-mode--${layout}`]">
    <!-- Header Strip -->
    <div class="kds-ticket__header" :class="headerColorClass">
      <div class="kds-ticket__table">
        <span class="kds-ticket__table-name">{{ tableDisplayName }}</span>
        <span v-if="settings.showDiners" class="kds-ticket__diners">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          {{ ticket.diners }}
        </span>
      </div>
      <div v-if="settings.showTimers" class="kds-ticket__timer">
        {{ liveTimer }}
      </div>
    </div>

    <!-- Items grouped by course -->
    <div class="kds-ticket__body">
      <div v-for="course in activeCourses" :key="course.id" class="kds-course">
        <!-- Course header (shown when there are multiple courses or it's a menu) -->
        <div v-if="ticket.courses.length > 1 || course.id !== 'general'" class="kds-course__header">
          {{ course.name }}
        </div>

        <div
          v-for="item in course.items"
          :key="item.id"
          class="kds-item"
          :class="{
            'kds-item--preparing': isPreparing(item.id),
            'kds-item--ready': isReady(item.id),
            'kds-item--served': isServed(item.id),
          }">
          <div class="kds-item__left">
            <span class="kds-item__qty">{{ remainingQty(item) }}</span>
            <div class="kds-item__info">
              <span class="kds-item__name">{{ item.name }}</span>
              <span v-if="item.notes" class="kds-item__notes">{{ item.notes }}</span>
              <div v-if="item.supplements?.length" class="kds-item__supplements">
                <span v-for="(sup, idx) in item.supplements" :key="idx" class="kds-item__supplement">
                  + {{ sup }}
                </span>
              </div>
            </div>
          </div>
          <div class="kds-item__actions">
            <button
              v-if="!isPreparing(item.id) && !isReady(item.id) && !isServed(item.id)"
              class="kds-item-action kds-action-prep"
              :title="$t('kds.start_preparing', 'Empezar a preparar')"
              @click.stop="toggleItem(item.id, item.quantity, 'PREPARING')">
              🍳 {{ $t("kds.prep", "Prep") }}
            </button>

            <button
              v-if="isPreparing(item.id)"
              class="kds-item-action kds-action-ready"
              :title="$t('kds.mark_ready', 'Marcar como listo')"
              @click.stop="toggleItem(item.id, item.quantity, 'READY')">
              ✅ {{ $t("kds.ready", "Listo") }}
            </button>

            <button
              v-if="isReady(item.id) || isServed(item.id)"
              class="kds-item-action kds-action-undo"
              :title="$t('kds.undo_to_pending', 'Deshacer (volver a pendiente)')"
              @click.stop="toggleItem(item.id, item.quantity, 'PENDING')">
              ↩️ {{ $t("kds.undo", "Deshacer") }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty / all served -->
      <div v-if="allItemsCount === 0" class="kds-ticket__done">
        <span>✅ {{ $t("kds.all_ready", "Todo listo") }}</span>
      </div>
    </div>

    <!-- Footer — Bump Button -->
    <button v-if="!showHistory" class="kds-ticket__bump" @click="bumpTicket">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
      {{ $t("kds.finish", "FIN") }}
    </button>

    <button v-else-if="isCompleted" class="kds-ticket__bump kds-ticket__bump--restore" @click="restoreTicket">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
      </svg>
      {{ $t("kds.undo_upper", "DESHACER") }}
    </button>
  </div>
</template>

<script>
import { computed } from "vue";
import KitchenService from "@/services/KitchenService";
import { useI18n } from "vue-i18n";
import moment from "moment";

export default {
  name: "TicketCard",
  props: {
    ticket: {
      type: Object,
      required: true,
    },
    layout: {
      type: String,
      default: "grid",
    },
  },
  emits: ["bump"],
  setup(props, { emit }) {
    const { t } = useI18n();
    // Live timer — updates every second
    const liveTimer = computed(() => {
      const _ = KitchenService.state.lastUpdated;
      const now = KitchenService.getCompletedAt(props.ticket.id) || Date.now();
      const diffMs = now - new Date(props.ticket.timestamp).getTime();
      const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
      const hours = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;

      if (hours > 0) {
        return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      }
      return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    });

    const elapsedMinutes = computed(() => {
      const _ = KitchenService.state.lastUpdated;
      const now = KitchenService.getCompletedAt(props.ticket.id) || Date.now();
      return (now - new Date(props.ticket.timestamp).getTime()) / 60000;
    });

    const settings = computed(() => KitchenService.state.settings);
    const fontSizeClass = computed(() => `fontSize-${settings.value.fontSize}`);

    // Table display name
    const tableDisplayName = computed(() => {
      return props.ticket.tableName || t("kds.table", "Mesa");
    });

    // Dynamic header color based on time and settings
    const headerColorClass = computed(() => {
      const mins = elapsedMinutes.value;
      const { timerWarning, timerUrgent } = settings.value;

      if (mins >= (timerUrgent || 15)) return "kds-header--urgent";
      if (mins >= (timerWarning || 5)) return "kds-header--warning";
      return "kds-header--fresh";
    });

    const ticketStatusClass = computed(() => {
      if (elapsedMinutes.value >= (settings.value.timerUrgent || 15)) return "kds-ticket--urgent";
      return "";
    });

    // Item status helpers
    const isItemDone = (itemId, quantity) => {
      const _ = KitchenService.state.stateVersion;
      return KitchenService.getReadyCount(props.ticket.id, itemId) >= quantity;
    };
    const isReady = (itemId) => {
      const status = KitchenService.getItemStatus(props.ticket.id, itemId);
      return status === "READY";
    };
    const isPreparing = (itemId) => {
      const status = KitchenService.getItemStatus(props.ticket.id, itemId);
      return status === "PREPARING" || status === "PARTIAL";
    };
    const isServed = (itemId) => {
      const status = KitchenService.getItemStatus(props.ticket.id, itemId);
      return status === "SERVED";
    };

    const remainingQty = (item) => {
      const _ = KitchenService.state.stateVersion;
      const done = KitchenService.getReadyCount(props.ticket.id, item.id);
      return Math.max(0, item.quantity - done);
    };

    const toggleItem = (itemId, quantity, forceStatus) => {
      KitchenService.toggleItemStatus(props.ticket.id, itemId, quantity, forceStatus);
    };

    // Active courses with filtered items
    const bumpTicket = () => {
      emit("bump", props.ticket.id);
    };

    const allItemsCount = computed(() => {
      return activeCourses.value.reduce((sum, c) => sum + c.items.length, 0);
    });

    const activeCourses = computed(() => {
      const _ = KitchenService.state.stateVersion;
      return props.ticket.courses
        .map((course) => {
          const visible = course.items.filter((item) => !KitchenService.isArticleHidden(item.idArticulo));
          const filtered = KitchenService.state.showHistory
            ? visible
            : visible.filter((item) => {
                if (isServed(item.id)) return false;
                if (isItemDone(item.id, item.quantity)) return false;
                return true;
              });
          return { ...course, items: filtered };
        })
        .filter((course) => course.items.length > 0);
    });

    const isCompleted = computed(() => {
      // A ticket is considered completed if all items are SERVED
      return props.ticket.courses.every((c) => c.items.every((item) => isServed(item.id)));
    });

    const restoreTicket = () => {
      KitchenService.restoreTicket(props.ticket.id);
    };

    return {
      liveTimer,
      tableDisplayName,
      headerColorClass,
      ticketStatusClass,
      isReady,
      isPreparing,
      isServed,
      toggleItem,
      remainingQty,
      activeCourses,
      allItemsCount,
      bumpTicket,
      restoreTicket,
      isCompleted,
      showHistory: computed(() => KitchenService.state.showHistory),
      settings,
      fontSizeClass,
    };
  },
};
</script>

<style scoped>
/* ── List Mode — horizontal row ── */
.layout-mode--list {
  flex-direction: row !important;
  height: auto !important;
  border-left: 6px solid var(--kds-accent) !important;
  min-height: 0 !important;
}

.layout-mode--list .kds-ticket__header {
  width: 160px;
  flex-shrink: 0;
  flex-direction: column !important;
  justify-content: center;
  align-items: flex-start;
  border-right: 1px solid var(--kds-divider);
  border-bottom: none;
  padding: 12px 16px;
}

.layout-mode--list .kds-ticket__body {
  flex: 1;
  max-height: 240px;
  overflow-y: auto;
  padding: 8px 12px;
}

.layout-mode--list .kds-ticket__bump {
  width: 72px;
  flex-shrink: 0;
  border-top: none;
  border-left: 1px solid var(--kds-divider);
  flex-direction: column;
  gap: 4px;
  font-size: 0.65rem;
  letter-spacing: 0.5px;
  border-radius: 0;
}

.layout-mode--list .kds-ticket__table-name {
  font-size: 1rem;
}

.layout-mode--list .kds-ticket__timer {
  font-size: 0.82rem;
  opacity: 0.85;
}

.kds-ticket {
  /* Font Size Variants */
  &.fontSize-small {
    --kds-font-scale: 0.85;
  }
  &.fontSize-medium {
    --kds-font-scale: 1;
  }
  &.fontSize-large {
    --kds-font-scale: 1.25;
  }

  background: var(--kds-card);
  border: 1px solid var(--kds-card-border);
  border-radius: var(--kds-radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--kds-shadow-sm);
  transition: box-shadow var(--kds-transition), border-color var(--kds-transition);
}

.kds-ticket:hover {
  box-shadow: var(--kds-shadow);
}

.kds-ticket--urgent {
  border-color: var(--kds-urgent);
  animation: kds-glow-pulse 3s infinite;
}

/* ── Header ── */
.kds-ticket__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  transition: background var(--kds-transition);
}

.kds-header--fresh {
  background: linear-gradient(135deg, #059669, #10b981);
}

.kds-header--warning {
  background: linear-gradient(135deg, #d97706, #f59e0b);
}

.kds-header--urgent {
  background: linear-gradient(135deg, #dc2626, #ef4444);
}

.kds-ticket__table {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.kds-ticket__table-name {
  font-weight: 700;
  font-size: calc(0.82rem * var(--kds-font-scale, 1));
  color: white;
  line-height: 1.2;
}

.kds-ticket__diners {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.kds-ticket__timer {
  font-weight: 800;
  font-size: calc(1.05rem * var(--kds-font-scale, 1));
  color: white;
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
}

/* ── Body ── */
.kds-ticket__body {
  flex: 1;
  padding: 2px 0;
  max-height: 340px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.kds-course + .kds-course {
  border-top: 2px solid var(--kds-divider);
}

.kds-course__header {
  padding: 6px 12px 2px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--kds-accent);
}

.kds-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--kds-item-border);
  transition: background var(--kds-transition), opacity var(--kds-transition);
  user-select: none;
  border-left: 3px solid transparent; /* Status indicator */
}

.kds-item:last-child {
  border-bottom: none;
}

.kds-item:hover {
  background: var(--kds-surface-hover);
}

.kds-item:active {
  background: var(--kds-surface);
}

.kds-item--preparing {
  background: rgba(217, 119, 6, 0.08); /* Faint amber */
  border-left-color: #d97706;
}

.kds-item--ready {
  background: rgba(5, 150, 105, 0.08); /* Faint green */
  border-left-color: #059669;
}

.kds-item--served {
  opacity: 0.45;
  background: #252a3a;
  pointer-events: none;
}

.kds-item--ready .kds-item__name {
  text-decoration: line-through;
  opacity: 0.6;
}

.kds-item--served {
  opacity: 0.35;
}

.kds-item__left {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.kds-item__qty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: calc(22px * var(--kds-font-scale, 1));
  height: calc(22px * var(--kds-font-scale, 1));
  padding: 0 4px;
  border-radius: 4px;
  background: var(--kds-badge-bg);
  color: var(--kds-text);
  font-weight: 700;
  font-size: calc(0.72rem * var(--kds-font-scale, 1));
  flex-shrink: 0;
}

.kds-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.kds-item__name {
  font-weight: 600;
  font-size: calc(0.78rem * var(--kds-font-scale, 1));
  color: var(--kds-text);
  transition: opacity var(--kds-transition);
}

.kds-item__notes {
  font-size: calc(0.72rem * var(--kds-font-scale, 1));
  color: #fbbf24; /* Amber/Yellow for high visibility */
  font-style: italic;
  font-weight: 600;
  margin-top: 1px;
}

.kds-item__supplements {
  display: flex;
  flex-direction: column;
  margin-top: 1px;
}

.kds-item__supplement {
  font-size: 0.63rem;
  color: #a0a0a0; /* Slightly dim text */
  font-weight: 500;
  line-height: 1.1;
}

.kds-item__actions {
  flex-shrink: 0;
  margin-left: 8px;
  display: flex;
  gap: 6px;
}

.kds-item-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: white;
}

.kds-item-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.kds-item-action:active {
  transform: translateY(1px);
}

.kds-action-prep {
  background: var(--kds-warning); /* d97706 amber-ish */
}

.kds-action-ready {
  background: var(--kds-fresh); /* 059669 green-ish */
}

.kds-action-undo {
  background: var(--kds-surface-hover);
  color: var(--kds-text-dim);
  border: 1px solid var(--kds-border);
  box-shadow: none;
}
.kds-action-undo:hover {
  color: white;
  background: #374151;
}

/* Done state */
.kds-ticket__done {
  padding: 20px;
  text-align: center;
  color: var(--kds-text-muted);
  font-size: 0.85rem;
  font-weight: 500;
}

/* ── Bump Button ── */
.kds-ticket__bump {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px;
  background: var(--kds-bump);
  border: none;
  color: white;
  width: 100%;
  padding: 14px;
  font-family: inherit;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  border-top: 1px solid var(--kds-divider);
  border-radius: 0 0 12px 12px;
}

.kds-ticket__bump:hover {
  background: #0d9488;
}

.kds-ticket__bump:active {
  background: #0f766e;
}

.kds-ticket__bump--restore {
  background: #3b82f6; /* Blue for restoration */
}

.kds-ticket__bump--restore:hover {
  background: #2563eb;
}

.kds-ticket__bump--restore:active {
  background: #1d4ed8;
}

.kds-ticket__bump:hover {
  background: var(--kds-bump-hover);
}

.kds-ticket__bump:active {
  transform: scale(0.98);
}
</style>
