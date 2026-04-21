<template>
  <div class="kds-settings">
    <!-- Header — Matching KitchenBoard.vue -->
    <header class="kds-toolbar">
      <div class="kds-toolbar__left">
        <button class="kds-btn kds-btn--icon" @click="$router.push('/')">
          <span class="back-icon">←</span>
        </button>
        <div class="kds-logo ms-2">
          <span class="kds-logo__text">{{ $t("kds.settings", "CONFIGURACIÓN") }}</span>
        </div>
      </div>

      <div class="kds-toolbar__center">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="kds-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id">
          {{ tab.label }}
        </button>
      </div>

      <div class="kds-toolbar__right">
        <div class="kds-clock">{{ currentTime }}</div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="settings-main">
      <div class="settings-scroll-area">
        <!-- Pantalla KDS Section -->
        <div v-if="activeTab === 'pantalla'" class="settings-group">
          <div class="settings-card">
            <h3 class="card-title">{{ $t("kds.screen_selection", "Selección de Pantalla KDS") }}</h3>
            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">{{ $t("kds.kds_screen", "Pantalla KDS") }}</div>
                <div class="setting-hint">
                  {{ $t("kds.kds_screen_hint", "Elige qué artículos se muestran en esta pantalla.") }}
                </div>
              </div>
            </div>

            <div class="kds-screen-grid">
              <div
                class="kds-screen-card"
                :class="{ active: !settings.kdsScreenName }"
                @click="save('kdsScreenName', '')">
                <div class="kds-screen-icon">📺</div>
                <div class="kds-screen-name">{{ $t("kds.all_screens", "TODAS") }}</div>
                <div class="kds-screen-desc">{{ $t("kds.all_screens_desc", "Muestra todos los artículos KDS") }}</div>
                <div class="kds-screen-active-dot" v-if="!settings.kdsScreenName"></div>
              </div>
              <div
                v-for="screen in availableKdsScreens"
                :key="screen"
                class="kds-screen-card"
                :class="{ active: settings.kdsScreenName === screen }"
                @click="save('kdsScreenName', screen)">
                <div class="kds-screen-icon">🖥️</div>
                <div class="kds-screen-name">{{ screen.toUpperCase() }}</div>
                <div class="kds-screen-desc">
                  {{ $t("kds.screen_filter_prefix", "Artículos con impresora") }} kds{{ screen }}
                </div>
                <div class="kds-screen-active-dot" v-if="settings.kdsScreenName === screen"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aspectos Section -->
        <div v-if="activeTab === 'aspectos'" class="settings-group">
          <div class="settings-card no-padding">
            <div class="layout-section-header">
              <span class="layout-section-title">{{ $t("kds.screen_layout", "Distribución de Pantalla") }}</span>
              <span class="layout-section-hint">{{
                $t("kds.screen_layout_hint", "Elige cómo se organizan los tickets")
              }}</span>
            </div>

            <div class="layout-grid-cards">
              <div
                v-for="lay in layoutOptions"
                :key="lay.id"
                class="layout-card"
                :class="{ active: settings.layout === lay.id }"
                @click="save('layout', lay.id)">
                <div class="layout-card-preview">
                  <div :class="['mini-board-dark', lay.id]">
                    <div v-for="n in lay.id === 'list' ? 3 : 6" :key="n" class="mini-tk">
                      <div class="mini-tk-hdr"></div>
                      <div class="mini-tk-line" v-for="l in 2" :key="l"></div>
                    </div>
                  </div>
                </div>
                <div class="layout-card-footer">
                  <span class="layout-card-name">{{ lay.label }}</span>
                  <div class="layout-card-active-dot" v-if="settings.layout === lay.id"></div>
                </div>
              </div>
            </div>

            <div class="columns-picker-section">
              <div class="columns-picker-label">{{ $t("kds.num_columns", "Número de Columnas") }}</div>
              <div class="columns-picker-grid">
                <button
                  v-for="col in columnOptions"
                  :key="col.id"
                  class="col-pick-btn"
                  :class="{ active: settings.columns === col.id }"
                  @click="save('columns', col.id)">
                  <span class="col-pick-icon">
                    <span v-for="c in col.id === 0 ? 4 : col.id" :key="c" class="col-pick-bar"></span>
                  </span>
                  <span class="col-pick-label">{{ col.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="settings-card mt-3">
            <h3 class="card-title">{{ $t("kds.appearance_timers", "Aspecto y Tiempos") }}</h3>

            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">{{ $t("kds.text_scale", "Escala de Texto") }}</div>
                <div class="setting-hint">
                  {{ $t("kds.text_scale_hint", "Ajusta el tamaño global de la interfaz") }}
                </div>
              </div>
              <div class="segmented-control">
                <button
                  v-for="size in fontSizeOptions"
                  :key="size.id"
                  class="segment-btn"
                  :class="{ active: settings.fontSize === size.id }"
                  @click="save('fontSize', size.id)">
                  {{ size.label }}
                </button>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">{{ $t("kds.warning_orange", "Aviso (Naranja)") }}</div>
                <div class="setting-hint">{{ $t("kds.warning_orange_hint", "Minutos antes de cambiar a aviso") }}</div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <input
                  type="range"
                  class="form-range"
                  min="1"
                  max="15"
                  v-model.number="settings.timerWarning"
                  @change="save('timerWarning', settings.timerWarning)" />
                <span class="badge bg-warning">{{ settings.timerWarning }}m</span>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">{{ $t("kds.urgent_red", "Urgente (Rojo)") }}</div>
                <div class="setting-hint">{{ $t("kds.urgent_red_hint", "Minutos antes de marcar como urgente") }}</div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <input
                  type="range"
                  class="form-range"
                  min="5"
                  max="30"
                  v-model.number="settings.timerUrgent"
                  @change="save('timerUrgent', settings.timerUrgent)" />
                <span class="badge bg-danger">{{ settings.timerUrgent }}m</span>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">{{ $t("kds.timer", "Cronómetro de Tiempo") }}</div>
                <div class="setting-hint">{{ $t("kds.timer_hint", "Mostrar tiempo transcurrido en cabecera") }}</div>
              </div>
              <label class="kds-switch">
                <input
                  type="checkbox"
                  v-model="settings.showTimers"
                  @change="save('showTimers', settings.showTimers)" />
                <span class="slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">{{ $t("kds.diners_counter", "Contador de Comensales") }}</div>
                <div class="setting-hint">{{ $t("kds.diners_counter_hint", "Ver número de personas por mesa") }}</div>
              </div>
              <label class="kds-switch">
                <input
                  type="checkbox"
                  v-model="settings.showDiners"
                  @change="save('showDiners', settings.showDiners)" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Sonido Section -->
        <div v-if="activeTab === 'sonido'" class="settings-group">
          <div class="settings-card no-padding">
            <div class="layout-section-header">
              <span class="layout-section-title">{{ $t("kds.sound_alert_type", "Tipo de Alerta Sonora") }}</span>
              <span class="layout-section-hint">{{
                $t("kds.sound_alert_hint", "Pulsa ▶ para escuchar antes de seleccionar")
              }}</span>
            </div>

            <div class="sound-options-list">
              <div
                v-for="snd in soundOptions"
                :key="snd.id"
                class="sound-option-row"
                :class="{ active: settings.soundType === snd.id }"
                @click="saveAndPreview('soundType', snd.id)">
                <div class="sound-option-icon">{{ snd.icon }}</div>
                <div class="sound-option-info">
                  <div class="sound-option-name">{{ snd.label }}</div>
                  <div class="sound-option-desc">{{ snd.desc }}</div>
                </div>
                <div class="sound-option-right">
                  <div class="sound-option-active-dot" v-if="settings.soundType === snd.id"></div>
                  <button class="sound-preview-btn" @click.stop="previewSound(snd.id)" title="Escuchar">▶</button>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-card mt-3">
            <h3 class="card-title">{{ $t("kds.options", "Opciones") }}</h3>

            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">{{ $t("kds.repeat_urgent", "Repetir en Urgentes") }}</div>
                <div class="setting-hint">
                  {{ $t("kds.repeat_urgent_hint", "Recordatorio sonoro para pedidos con retraso") }}
                </div>
              </div>
              <label class="kds-switch">
                <input
                  type="checkbox"
                  v-model="settings.repeatUrgent"
                  @change="save('repeatUrgent', settings.repeatUrgent)" />
                <span class="slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">{{ $t("kds.sounds_enabled", "Sonidos activados") }}</div>
                <div class="setting-hint">
                  {{ $t("kds.sounds_enabled_hint", "Activar o desactivar todos los sonidos") }}
                </div>
              </div>
              <label class="kds-switch">
                <input type="checkbox" v-model="soundEnabled" @change="toggleSound" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Impresión Section -->
        <div v-if="activeTab === 'impresion'" class="settings-group">
          <div class="settings-card">
            <h3 class="card-title">{{ $t("kds.physical_print", "Impresión Física") }}</h3>

            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">{{ $t("kds.print_to_printer", "Imprimir en impresora") }}</div>
                <div class="setting-hint">
                  {{ $t("kds.print_to_printer_hint", "Imprime los tickets del KDS también en una impresora física") }}
                </div>
              </div>
              <label class="kds-switch">
                <input
                  type="checkbox"
                  v-model="settings.printEnabled"
                  @change="save('printEnabled', settings.printEnabled)" />
                <span class="slider"></span>
              </label>
            </div>

            <div class="setting-row" v-if="settings.printEnabled">
              <div class="setting-text">
                <div class="setting-label">{{ $t("kds.target_printer", "Impresora destino") }}</div>
                <div class="setting-hint">
                  {{ $t("kds.target_printer_hint", "Selecciona la impresora donde imprimir") }}
                </div>
              </div>
              <div class="kds-select-wrap">
                <select
                  class="kds-select"
                  :value="settings.printPrinter"
                  @change="save('printPrinter', $event.target.value)">
                  <option value="" disabled>{{ $t("kds.select", "Seleccionar...") }}</option>
                  <option v-for="p in availablePrinters" :key="p.full" :value="p.full">{{ p.name }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { computed, ref, onMounted } from "vue";
import KitchenService from "@/services/KitchenService";
import { useI18n } from "vue-i18n";
import axios from "axios";
import moment from "moment";

export default {
  name: "SettingsView",
  setup() {
    const { t } = useI18n();
    const activeTab = ref("aspectos");
    const currentTime = ref(moment().format("HH:mm"));
    const availablePrinters = ref([]);
    const availableKdsScreens = ref([]);

    const tabs = computed(() => [
      { id: "pantalla", label: t("kds.tab_screen", "Pantalla KDS") },
      { id: "aspectos", label: t("kds.tab_appearance", "Aspectos") },
      { id: "sonido", label: t("kds.tab_sound", "Sonido") },
      { id: "impresion", label: t("kds.tab_print", "Impresión") },
    ]);

    const fontSizeOptions = computed(() => [
      { id: "small", label: t("kds.size_small", "PEQUEÑO") },
      { id: "medium", label: t("kds.size_normal", "NORMAL") },
      { id: "large", label: t("kds.size_large", "GRANDE") },
    ]);

    const columnOptions = [
      { id: 0, label: "AUTO" },
      { id: 2, label: "2" },
      { id: 3, label: "3" },
      { id: 4, label: "4" },
      { id: 5, label: "5" },
    ];

    const soundOptions = computed(() => [
      {
        id: "classic",
        label: t("kds.sound_classic", "Clásico"),
        icon: "🔔",
        desc: t("kds.sound_classic_desc", "Dos tonos suaves ascendentes, fácil de escuchar"),
      },
      {
        id: "minimal",
        label: t("kds.sound_minimal", "Mínimo"),
        icon: "🔕",
        desc: t("kds.sound_minimal_desc", "Un pitido corto y discreto, ideal para ambientes tranquilos"),
      },
      {
        id: "digital",
        label: t("kds.sound_digital", "Digital"),
        icon: "⚡",
        desc: t("kds.sound_digital_desc", "Dos beeps electrónicos rápidos, estilo retro"),
      },
      {
        id: "chime",
        label: t("kds.sound_chime", "Carillón"),
        icon: "🎵",
        desc: t("kds.sound_chime_desc", "Tres notas ascendentes meló dicas, sonido agradable"),
      },
      {
        id: "alert",
        label: t("kds.sound_alert", "Alerta"),
        icon: "🚨",
        desc: t("kds.sound_alert_desc", "Doble beep urgente, máxima atención"),
      },
    ]);

    const layoutOptions = computed(() => [
      { id: "grid", label: t("kds.layout_grid", "Mosaico") },
      { id: "columns", label: t("kds.layout_columns", "Columnas") },
      { id: "list", label: t("kds.layout_list", "Lista") },
    ]);

    const settings = computed(() => KitchenService.state.settings);
    const soundEnabled = computed(() => KitchenService.state.soundEnabled);

    const save = (key, value) => {
      KitchenService.updateSetting(key, value);
    };

    const previewSound = (typeId) => {
      KitchenService.playNewTicketSound(typeId);
    };

    const saveAndPreview = (key, value) => {
      KitchenService.updateSetting(key, value);
      // Short delay so the setting is saved before playing
      setTimeout(() => KitchenService.playNewTicketSound(value), 50);
    };

    const toggleSound = () => {
      KitchenService.toggleSound();
    };

    onMounted(async () => {
      setInterval(() => {
        currentTime.value = moment().format("HH:mm");
      }, 1000);

      axios
        .post("impresora/getImpresorasDisponibles")
        .then((res) => {
          availablePrinters.value = res.data || [];
        })
        .catch((err) => console.error("Failed to load printers", err));

      availableKdsScreens.value = await KitchenService.fetchAvailableKdsScreens();
    });

    return {
      activeTab,
      tabs,
      settings,
      soundEnabled,
      availablePrinters,
      availableKdsScreens,
      save,
      previewSound,
      saveAndPreview,
      toggleSound,
      currentTime,
      fontSizeOptions,
      columnOptions,
      soundOptions,
      layoutOptions,
    };
  },
};
</script>

<style scoped>
.kds-settings {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: var(--kds-bg); /* Use global grey bg */
  overflow: hidden;
  font-family: "Inter", sans-serif;
}

/* ── Inherited Toolbar Style ── */
.kds-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  height: 44px;
  background: var(--kds-toolbar);
  border-bottom: 1px solid var(--kds-toolbar-border);
  flex-shrink: 0;
}

.kds-toolbar__left,
.kds-toolbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 200px;
}

.kds-toolbar__right {
  justify-content: flex-end;
}

.kds-logo__text {
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 2px;
  color: var(--kds-text-muted);
}

.kds-clock {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--kds-text);
}

.kds-btn {
  background: transparent;
  border: 1px solid var(--kds-card-border);
  padding: 4px 10px;
  border-radius: var(--kds-radius-sm);
  cursor: pointer;
}

.back-icon {
  font-size: 1.1rem;
  color: var(--kds-text);
}

/* ── Tabs Style ── */
.kds-toolbar__center {
  display: flex;
  height: 100%;
}

.kds-tab {
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--kds-text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  letter-spacing: 1px;
  background: none;
  border: none;
}

.kds-tab:hover {
  color: var(--kds-text);
}
.kds-tab.active {
  color: var(--kds-accent);
  border-bottom-color: var(--kds-accent);
}

/* ── Main Layout ── */
.settings-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.settings-scroll-area {
  max-width: 600px;
  margin: 0 auto;
}

.settings-group {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Cards ── */
.settings-card {
  background: var(--kds-surface);
  border-radius: var(--kds-radius);
  border: 1px solid var(--kds-card-border);
  box-shadow: var(--kds-shadow-sm);
  padding: 20px;
}

.card-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--kds-text-dim);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
}
.settings-card.no-padding {
  padding: 0;
  overflow: hidden;
}

/* ── Layout Section Header ── */
.layout-section-header {
  padding: 20px 20px 12px;
  border-bottom: 1px solid var(--kds-divider);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.layout-section-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--kds-text-dim);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.layout-section-hint {
  font-size: 0.72rem;
  color: var(--kds-text-muted);
}

/* ── New Grid Layout Cards ── */
.layout-grid-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
}

.layout-card {
  border-radius: 10px;
  border: 2px solid var(--kds-card-border);
  background: var(--kds-bg);
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}

.layout-card:hover {
  border-color: var(--kds-accent);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.15);
}

.layout-card.active {
  border-color: var(--kds-accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.layout-card-preview {
  aspect-ratio: 4/3;
  background: #0f1117;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Dark Mini-Mockups ── */
.mini-board-dark {
  width: 100%;
  height: 100%;
  gap: 4px;
  display: grid;
}
.mini-board-dark.grid {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
}
.mini-board-dark.columns {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 1fr;
}
.mini-board-dark.list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mini-tk {
  background: #1a1d2e;
  border: 1px solid #2a2d3e;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  padding: 3px;
  gap: 2px;
  overflow: hidden;
}

.layout-card.active .mini-tk {
  border-color: rgba(99, 102, 241, 0.4);
}

.mini-tk-hdr {
  height: 6px;
  background: #374151;
  border-radius: 1px;
  flex-shrink: 0;
}
.layout-card.active .mini-tk-hdr {
  background: var(--kds-accent);
}

.mini-tk-line {
  height: 2px;
  background: #2a2d3e;
  border-radius: 1px;
  width: 75%;
}

.layout-card-footer {
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--kds-surface);
  border-top: 1px solid var(--kds-divider);
}

.layout-card-name {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--kds-text);
  letter-spacing: 0.5px;
}

.layout-card-active-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--kds-accent);
  box-shadow: 0 0 6px var(--kds-accent);
}

/* ── Columns Picker ── */
.columns-picker-section {
  padding: 16px;
  border-top: 1px solid var(--kds-divider);
}

.columns-picker-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--kds-text-muted);
  margin-bottom: 10px;
}

.columns-picker-grid {
  display: flex;
  gap: 8px;
}

.col-pick-btn {
  flex: 1;
  background: var(--kds-bg);
  border: 2px solid var(--kds-card-border);
  border-radius: 8px;
  padding: 8px 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: border-color 0.2s, background 0.2s;
}

.col-pick-btn:hover {
  border-color: var(--kds-accent);
  background: var(--kds-surface-hover);
}

.col-pick-btn.active {
  border-color: var(--kds-accent);
  background: rgba(99, 102, 241, 0.08);
}

.col-pick-icon {
  display: flex;
  gap: 2px;
  height: 18px;
  align-items: stretch;
}

.col-pick-bar {
  display: block;
  width: 5px;
  background: var(--kds-card-border);
  border-radius: 1px;
  transition: background 0.2s;
}

.col-pick-btn.active .col-pick-bar {
  background: var(--kds-accent);
}

.col-pick-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--kds-text-muted);
  letter-spacing: 0.5px;
}

.col-pick-btn.active .col-pick-label {
  color: var(--kds-accent);
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.setting-row + .setting-row {
  border-top: 1px solid var(--kds-divider);
}

.setting-label {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--kds-text);
}

.setting-hint {
  font-size: 0.75rem;
  color: var(--kds-text-muted);
}

/* ── Premium Segmented Control ── */
.segmented-control {
  background: var(--kds-bg);
  padding: 3px;
  border-radius: 10px;
  display: flex;
  gap: 2px;
}

.segment-btn {
  border: none;
  background: transparent;
  padding: 6px 16px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--kds-text-muted);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.segment-btn.active {
  background: var(--kds-surface);
  color: var(--kds-accent);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* ── Custom Switch ── */
.kds-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
}

.kds-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--kds-badge-bg);
  transition: 0.3s;
  border-radius: 26px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input:checked + .slider {
  background-color: var(--kds-accent);
}
input:checked + .slider:before {
  transform: translateX(22px);
}

/* ── Sound Options ── */
.sound-options-list {
  display: flex;
  flex-direction: column;
}

.sound-option-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid var(--kds-divider);
  transition: background 0.2s;
}

.sound-option-row:last-child {
  border-bottom: none;
}

.sound-option-row:hover {
  background: var(--kds-surface-hover);
}

.sound-option-row.active {
  background: rgba(99, 102, 241, 0.04);
  box-shadow: inset 4px 0 0 0 var(--kds-accent);
}

.sound-option-icon {
  font-size: 1.5rem;
  width: 36px;
  text-align: center;
  flex-shrink: 0;
}

.sound-option-info {
  flex: 1;
  min-width: 0;
}

.sound-option-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--kds-text);
}

.sound-option-desc {
  font-size: 0.75rem;
  color: var(--kds-text-muted);
  margin-top: 2px;
}

.sound-option-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.sound-option-active-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--kds-accent);
  box-shadow: 0 0 6px var(--kds-accent);
}

.sound-preview-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.5px solid var(--kds-accent);
  background: rgba(99, 102, 241, 0.08);
  color: var(--kds-accent);
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.sound-preview-btn:hover {
  background: var(--kds-accent);
  color: white;
  transform: scale(1.1);
}

.sound-preview-btn:active {
  transform: scale(0.95);
}

/* ── Select Field ── */
.kds-select-wrap {
  position: relative;
}

.kds-select {
  background: var(--kds-bg);
  border: 1.5px solid var(--kds-card-border);
  border-radius: 8px;
  padding: 8px 32px 8px 14px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--kds-text);
  min-width: 180px;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color 0.2s;
}

.kds-select:focus {
  border-color: var(--kds-accent);
}

.kds-select option {
  background: var(--kds-surface);
  color: var(--kds-text);
}

/* ── KDS Screen Selector ── */
.kds-screen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.kds-screen-card {
  position: relative;
  border-radius: 10px;
  border: 2px solid var(--kds-card-border);
  background: var(--kds-bg);
  cursor: pointer;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  text-align: center;
}

.kds-screen-card:hover {
  border-color: var(--kds-accent);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.15);
}

.kds-screen-card.active {
  border-color: var(--kds-accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  background: rgba(99, 102, 241, 0.04);
}

.kds-screen-icon {
  font-size: 2rem;
}

.kds-screen-name {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--kds-text);
  letter-spacing: 1px;
}

.kds-screen-desc {
  font-size: 0.68rem;
  color: var(--kds-text-muted);
  line-height: 1.3;
}

.kds-screen-active-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--kds-accent);
  box-shadow: 0 0 6px var(--kds-accent);
}

.kds-screen-empty {
  margin-top: 16px;
  padding: 16px;
  background: var(--kds-bg);
  border-radius: 8px;
  border: 1px dashed var(--kds-card-border);
}

.kds-screen-empty p {
  font-size: 0.8rem;
  color: var(--kds-text-muted);
  line-height: 1.5;
  margin: 0;
}
</style>
