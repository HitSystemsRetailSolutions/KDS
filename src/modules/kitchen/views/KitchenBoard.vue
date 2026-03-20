<template>
  <div class="kds-board">
    <!-- Toolbar -->
    <header class="kds-toolbar">
      <div class="kds-toolbar__left">
        <div class="kds-logo">
          <span class="kds-logo__icon">🍳</span>
          <span class="kds-logo__text">KDS</span>
        </div>
      </div>

      <div class="kds-toolbar__center">
        <div class="kds-stat">
          <span class="kds-stat__value">{{ activeCount }}</span>
          <span class="kds-stat__label">Activos</span>
        </div>
        <div class="kds-stat__divider"></div>
        <div class="kds-stat">
          <span class="kds-stat__value">{{ avgPrepTime }}</span>
          <span class="kds-stat__label">Tiempo Medio</span>
        </div>
        <div class="kds-stat__divider"></div>
        <div class="kds-stat">
          <span class="kds-stat__value">{{ completedToday }}</span>
          <span class="kds-stat__label">Completados</span>
        </div>
      </div>

      <div class="kds-toolbar__right">
        <button
          class="kds-btn kds-btn--icon"
          :class="{ 'kds-btn--active': soundEnabled }"
          @click="toggleSound"
          :title="soundEnabled ? 'Sonido activado' : 'Sonido desactivado'"
        >
          <span v-if="soundEnabled">🔊</span>
          <span v-else>🔇</span>
        </button>

        <button
          class="kds-btn kds-btn--icon"
          @click="$router.push('/settings')"
          title="Configuración"
        >
          <span>⚙️</span>
        </button>

        <button
          class="kds-btn"
          :class="{ 'kds-btn--active': showHistory }"
          @click="toggleHistory"
        >
          <span class="kds-btn__icon">📋</span>
          {{ showHistory ? "Ocultar Acabadas" : "Ver Acabadas" }}
        </button>

        <div
          class="kds-connection"
          :class="isConnected ? 'kds-connection--on' : 'kds-connection--off'"
        >
          <span class="kds-connection__dot"></span>
          {{ isConnected ? "Conectado" : "Sin conexión" }}
        </div>

        <div class="kds-clock">{{ currentTime }}</div>
      </div>
    </header>

    <!-- Ticket Grid -->
    <main
      class="kds-grid"
      :class="[`layout-${settings.layout}`]"
      :style="gridStyle"
    >
      <TicketCard
        v-for="ticket in tickets"
        :key="ticket.id"
        :ticket="ticket"
        :layout="settings.layout"
        @bump="handleBump"
      />

      <!-- Empty State -->
      <div v-if="tickets.length === 0 && isConnected" class="kds-empty">
        <div class="kds-empty__icon">✨</div>
        <div class="kds-empty__title">¡Todo al día!</div>
        <div class="kds-empty__sub">No hay pedidos pendientes</div>
      </div>

      <!-- Disconnected State -->
      <div v-if="!isConnected" class="kds-empty kds-empty--error">
        <div class="kds-empty__icon">📡</div>
        <div class="kds-empty__title">Conectando...</div>
        <div class="kds-empty__sub">Esperando conexión con el servidor</div>
      </div>
    </main>
  </div>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import KitchenService from "@/services/KitchenService";
import TicketCard from "@/modules/kitchen/components/KitchenTicket.vue";
import moment from "moment";

export default {
  name: "KitchenBoard",
  components: { TicketCard },
  setup() {
    const currentTime = ref(moment().format("HH:mm"));

    onMounted(() => {
      KitchenService.init();
      setInterval(() => {
        currentTime.value = moment().format("HH:mm");
      }, 1000);
    });

    const handleBump = (ticketId) => {
      KitchenService.bumpTicket(ticketId);
    };

    const tickets = computed(() => {
      const all = KitchenService.state.tickets;
      // Read stateVersion to trigger reactivity on item status changes
      const _ = KitchenService.state.stateVersion;
      if (KitchenService.state.showHistory) return all;
      // Hide tickets where all visible items are done
      return all.filter((ticket) => {
        const hasActive = ticket.courses.some((course) =>
          course.items.some((item) => {
            // Skip hidden articles — they don't count
            if (KitchenService.isArticleHidden(item.idArticulo)) return false;
            const status = KitchenService.getItemStatus(ticket.id, item.id);
            if (status === "READY" || status === "SERVED") return false;
            // Check quantity-based done
            const readyCount = KitchenService.getReadyCount(ticket.id, item.id);
            return readyCount < item.quantity;
          }),
        );
        return hasActive;
      });
    });

    return {
      tickets,
      activeCount: computed(() => tickets.value.length),
      avgPrepTime: computed(() => {
        const avg = KitchenService.state.avgPrepTime;
        if (!avg || avg === 0) return "--:--";
        const totalSecs = Math.floor(avg);
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;

        if (hours > 0) {
          return `${hours}:${String(mins).padStart(2, "0")}:${String(
            secs,
          ).padStart(2, "0")}`;
        }
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
          2,
          "0",
        )}`;
      }),
      completedToday: computed(() => KitchenService.state.completedToday || 0),
      isConnected: computed(() => KitchenService.state.isConnected),
      showHistory: computed(() => KitchenService.state.showHistory),
      soundEnabled: computed(() => KitchenService.state.soundEnabled),
      settings: computed(() => KitchenService.state.settings),
      gridStyle: computed(() => {
        const { columns, layout } = KitchenService.state.settings;

        if (layout === "grid") {
          if (columns > 0)
            return { "grid-template-columns": `repeat(${columns}, 1fr)` };
          return {
            "grid-template-columns": "repeat(auto-fill, minmax(280px, 1fr))",
          };
        }

        if (layout === "columns") {
          const cols = columns > 0 ? columns : 4;
          return { "grid-template-columns": `repeat(${cols}, 300px)` };
        }

        if (layout === "list") {
          return { display: "flex", "flex-direction": "column", gap: "16px" };
        }

        return {};
      }),
      toggleHistory: KitchenService.toggleHistory,
      toggleSound: KitchenService.toggleSound,
      currentTime,
      handleBump,
    };
  },
};
</script>

<style scoped>
.kds-board {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: var(--kds-bg);
  overflow: hidden;
}

/* ── Toolbar ── */
.kds-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  height: 44px;
  background: var(--kds-toolbar);
  border-bottom: 1px solid var(--kds-toolbar-border);
  flex-shrink: 0;
  gap: 8px;
}

.kds-toolbar__left,
.kds-toolbar__center,
.kds-toolbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kds-toolbar__center {
  gap: 0;
}

/* Logo */
.kds-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kds-logo__icon {
  font-size: 1.1rem;
}

.kds-logo__text {
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 2px;
  color: var(--kds-text);
}

/* Stats */
.kds-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 12px;
}

.kds-stat__value {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--kds-text);
  line-height: 1.2;
}

.kds-stat__label {
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--kds-text-muted);
  line-height: 1.2;
}

.kds-stat__divider {
  width: 1px;
  height: 20px;
  background: var(--kds-divider);
}

/* Buttons */
.kds-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid var(--kds-card-border);
  border-radius: var(--kds-radius-sm);
  background: transparent;
  color: var(--kds-text-muted);
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--kds-transition);
  white-space: nowrap;
}

.kds-btn:hover {
  background: var(--kds-surface-hover);
  color: var(--kds-text);
  border-color: var(--kds-text-dim);
}

.kds-btn--active {
  background: var(--kds-accent);
  border-color: var(--kds-accent);
  color: white;
}

.kds-btn--active:hover {
  background: var(--kds-accent-light);
}

.kds-btn--icon {
  padding: 4px 8px;
  font-size: 0.85rem;
}

.kds-btn__icon {
  font-size: 0.75rem;
}

/* Connection */
.kds-connection {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kds-connection__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.kds-connection--on .kds-connection__dot {
  background: var(--kds-fresh);
  box-shadow: 0 0 6px var(--kds-fresh);
}

.kds-connection--on {
  color: var(--kds-fresh);
}

.kds-connection--off .kds-connection__dot {
  background: var(--kds-urgent);
  box-shadow: 0 0 6px var(--kds-urgent);
}

.kds-connection--off {
  color: var(--kds-urgent);
}

/* Clock */
.kds-clock {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--kds-text);
  font-variant-numeric: tabular-nums;
}

/* ── Ticket Grid Layouts ── */
.kds-grid {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: grid;
  gap: 16px;
  align-content: start;
  -webkit-overflow-scrolling: touch;
}

.layout-grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.layout-columns {
  overflow-x: auto;
  overflow-y: auto;
  align-content: start;
  grid-auto-rows: max-content;
}

/* In columns mode, tickets size to their content (no stretch) */

.layout-list {
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  display: flex !important;
  flex-direction: column !important;
  height: auto !important;
}

.layout-list :deep(.kds-ticket) {
  flex-direction: row;
  height: auto;
  border-left: 6px solid var(--kds-accent);
}

.layout-list :deep(.kds-ticket__header) {
  width: 180px;
  flex-shrink: 0;
  flex-direction: column;
  justify-content: center;
  border-right: 1px solid var(--kds-divider);
  padding: 16px;
}

.layout-list :deep(.kds-ticket__body) {
  flex: 1;
  max-height: none;
  overflow-y: visible;
  padding: 8px 16px;
}

.layout-list :deep(.kds-ticket__bump) {
  width: 80px;
  flex-shrink: 0;
  border-left: 1px solid var(--kds-divider);
  border-top: none;
  border-radius: 0 var(--kds-radius) var(--kds-radius) 0;
}

/* columns deep overrides handled above */

/* ── Empty State ── */
.kds-empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.kds-empty__icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.6;
}

.kds-empty__title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--kds-text);
  margin-bottom: 6px;
}

.kds-empty__sub {
  font-size: 0.85rem;
  color: var(--kds-text-muted);
}

.kds-empty--error .kds-empty__icon {
  animation: kds-glow-pulse 2s infinite;
}
</style>
