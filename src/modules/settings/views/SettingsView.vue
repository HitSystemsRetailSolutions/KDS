<template>
  <div class="kds-settings">
    <!-- Header — Matching KitchenBoard.vue -->
    <header class="kds-toolbar">
      <div class="kds-toolbar__left">
        <button class="kds-btn kds-btn--icon" @click="$router.push('/')">
          <span class="back-icon">←</span>
        </button>
        <div class="kds-logo ms-2">
          <span class="kds-logo__text">CONFIGURACIÓN</span>
        </div>
      </div>

      <div class="kds-toolbar__center">
        <div 
          v-for="tab in tabs" 
          :key="tab.id"
          class="nav-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </div>
      </div>

      <div class="kds-toolbar__right">
        <div class="kds-clock">{{ currentTime }}</div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="settings-main">
      <div class="settings-scroll-area">
        
        <!-- Aspectos Section -->
        <div v-if="activeTab === 'aspectos'" class="settings-group">
          <div class="settings-card no-padding">
            <h3 class="card-title p-4 mb-0">Distribución de Pantalla</h3>
            
            <div class="layout-list-vertical">
              <div 
                v-for="lay in layoutOptions" 
                :key="lay.id"
                class="layout-row-card"
                :class="{ active: settings.layout === lay.id }"
                @click="save('layout', lay.id)"
              >
                <div class="layout-row-visual">
                   <!-- Real Mini-Mockup of the Board Layout -->
                   <div :class="['mini-board', lay.id]">
                     <div v-for="n in (lay.id === 'list' ? 3 : 6)" :key="n" class="mini-ticket">
                       <div class="mini-ticket-header"></div>
                       <div class="mini-ticket-line" v-for="l in 2" :key="l"></div>
                     </div>
                   </div>
                </div>
                <div class="layout-row-info">
                  <div class="layout-row-header">
                    <span class="layout-row-name">{{ lay.label }}</span>
                    <div class="layout-row-check" v-if="settings.layout === lay.id">
                      <span>✓ Selección Activa</span>
                    </div>
                  </div>
                  <span class="layout-row-desc">{{ lay.desc }}</span>
                </div>
              </div>
            </div>

            <div v-if="settings.layout !== 'list'" class="setting-row mt-3">
              <div class="setting-text">
                <div class="setting-label">Columnas (Fijo)</div>
                <div class="setting-hint">0 para ajuste automático dinámico</div>
              </div>
              <div class="segmented-control">
                <button 
                  v-for="col in columnOptions" 
                  :key="col.id"
                  class="segment-btn"
                  :class="{ active: settings.columns === col.id }"
                  @click="save('columns', col.id)"
                >
                  {{ col.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="settings-card mt-3">
            <h3 class="card-title">Aspecto y Tiempos</h3>
            
            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">Escala de Texto</div>
                <div class="setting-hint">Ajusta el tamaño global de la interfaz</div>
              </div>
              <div class="segmented-control">
                <button 
                  v-for="size in fontSizeOptions" 
                  :key="size.id"
                  class="segment-btn"
                  :class="{ active: settings.fontSize === size.id }"
                  @click="save('fontSize', size.id)"
                >
                  {{ size.label }}
                </button>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">Aviso (Naranja)</div>
                <div class="setting-hint">Minutos antes de cambiar a aviso</div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <input type="range" class="form-range" min="1" max="15" v-model.number="settings.timerWarning" @change="save('timerWarning', settings.timerWarning)">
                <span class="badge bg-warning">{{ settings.timerWarning }}m</span>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">Urgente (Rojo)</div>
                <div class="setting-hint">Minutos antes de marcar como urgente</div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <input type="range" class="form-range" min="5" max="30" v-model.number="settings.timerUrgent" @change="save('timerUrgent', settings.timerUrgent)">
                <span class="badge bg-danger">{{ settings.timerUrgent }}m</span>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">Cronómetro de Tiempo</div>
                <div class="setting-hint">Mostrar tiempo transcurrido en cabecera</div>
              </div>
              <label class="kds-switch">
                <input type="checkbox" v-model="settings.showTimers" @change="save('showTimers', settings.showTimers)">
                <span class="slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">Contador de Comensales</div>
                <div class="setting-hint">Ver número de personas por mesa</div>
              </div>
              <label class="kds-switch">
                <input type="checkbox" v-model="settings.showDiners" @change="save('showDiners', settings.showDiners)">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Sonido Section -->
        <div v-if="activeTab === 'sonido'" class="settings-group">
          <div class="settings-card">
            <h3 class="card-title">Alertas Sonoras</h3>
            
            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">Tipo de Alerta</div>
                <div class="setting-hint">Sonido para nuevos pedidos</div>
              </div>
              <div class="segmented-control">
                <button 
                  v-for="snd in soundOptions" 
                  :key="snd.id"
                  class="segment-btn"
                  :class="{ active: settings.soundType === snd.id }"
                  @click="save('soundType', snd.id)"
                >
                  {{ snd.label }}
                </button>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">Repetir en Urgentes</div>
                <div class="setting-hint">Recordatorio sonoro para retrasos</div>
              </div>
              <label class="kds-switch">
                <input type="checkbox" v-model="settings.repeatUrgent" @change="save('repeatUrgent', settings.repeatUrgent)">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Teclas Section -->
        <div v-if="activeTab === 'teclas'" class="settings-group">
          <div class="settings-card">
            <h3 class="card-title">Interactividad</h3>
            
            <div class="setting-row">
              <div class="setting-text">
                <div class="setting-label">Modo Táctil Extendido</div>
                <div class="setting-hint">Botones ampliados para pantallas táctiles</div>
              </div>
              <label class="kds-switch">
                <input type="checkbox" v-model="settings.touchMode" @change="save('touchMode', settings.touchMode)">
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="keyboard-map mt-3">
             <div class="map-item">
               <span class="key-tag">ESPACIO</span>
               <span class="key-function">Finalizar ticket seleccionado</span>
             </div>
             <div class="map-item">
               <span class="key-tag">0-9</span>
               <span class="key-function">Cambiar estado de líneas del ticket</span>
             </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import KitchenService from '@/services/KitchenService';
import moment from 'moment';

export default {
  name: 'SettingsView',
  setup() {
    const activeTab = ref('aspectos');
    const currentTime = ref(moment().format('HH:mm'));
    
    const tabs = [
      { id: 'aspectos', name: 'ASPECTOS', icon: 'palette' },
      { id: 'sonido', name: 'SONIDO', icon: 'volume-up' },
      { id: 'teclas', name: 'TECLAS', icon: 'keyboard' },
    ];

    const fontSizeOptions = [
      { id: 'small', label: 'PEQUEÑO' },
      { id: 'medium', label: 'NORMAL' },
      { id: 'large', label: 'GRANDE' }
    ];

    const columnOptions = [
      { id: 0, label: 'AUTO' },
      { id: 2, label: '2' },
      { id: 3, label: '3' },
      { id: 4, label: '4' },
      { id: 5, label: '5' }
    ];

    const soundOptions = [
      { id: 'classic', label: 'CLÁSICO' },
      { id: 'minimal', label: 'MÍNIMO' },
      { id: 'digital', label: 'DIGITAL' }
    ];

    const layoutOptions = [
      { 
        id: 'grid', 
        label: 'Mosaico (Grid)', 
        desc: 'Distribución en cuadrícula para pantallas grandes. Aprovecha todo el espacio disponible.' 
      },
      { 
        id: 'columns', 
        label: 'Columnas Verticales', 
        desc: 'Flujo estilo Kanban. Ideal para cocinas con mucho movimiento y estados.' 
      },
      { 
        id: 'list', 
        label: 'Lista Lineal (Todo Recto)', 
        desc: 'Tickets a pantalla completa. Lectura rápida y secuencial de pedidos.' 
      }
    ];

    const settings = computed(() => KitchenService.state.settings);

    const save = (key, value) => {
      KitchenService.updateSetting(key, value);
    };

    onMounted(() => {
      setInterval(() => {
        currentTime.value = moment().format('HH:mm');
      }, 1000);
    });

    return {
      activeTab,
      tabs,
      settings,
      save,
      currentTime,
      fontSizeOptions,
      columnOptions,
      soundOptions,
      layoutOptions
    };
  }
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
  font-family: 'Inter', sans-serif;
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

.kds-toolbar__left, .kds-toolbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 200px;
}

.kds-toolbar__right { justify-content: flex-end; }

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

.back-icon { font-size: 1.1rem; color: var(--kds-text); }

/* ── Tabs Style ── */
.kds-toolbar__center {
  display: flex;
  height: 100%;
}

.nav-tab {
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
}

.nav-tab:hover { color: var(--kds-text); }
.nav-tab.active {
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

.layout-icon-img, .layout-svg-icon {
  max-width: 60%;
  max-height: 60%;
  color: var(--kds-accent);
}

.settings-group {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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
.settings-card.no-padding { padding: 0; overflow: hidden; }

/* Layout Row Cards */
.layout-list-vertical {
  display: flex;
  flex-direction: column;
}

.layout-row-card {
  display: flex;
  align-items: stretch;
  padding: 24px;
  cursor: pointer;
  border-bottom: 1px solid var(--kds-divider);
  transition: all 0.3s ease;
  gap: 24px;
}

.layout-row-card:last-child { border-bottom: none; }

.layout-row-card:hover {
  background: var(--kds-surface-hover);
}

.layout-row-card.active {
  background: rgba(99, 102, 241, 0.04);
  box-shadow: inset 4px 0 0 0 var(--kds-accent);
}

.layout-row-visual {
  width: 140px;
  height: 90px;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
}

.mini-board {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 4px;
}

.mini-board.grid { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr); }
.mini-board.columns { grid-auto-flow: column; grid-template-columns: repeat(3, 1fr); }
.mini-board.list { display: flex; flex-direction: column; }

.mini-ticket {
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  padding: 2px;
  gap: 2px;
}

.mini-ticket-header { height: 6px; background: #94a3b8; border-radius: 1px; }
.mini-ticket-line { height: 2px; background: #e2e8f0; border-radius: 1px; width: 80%; }

.active .mini-ticket-header { background: var(--kds-accent); }

.layout-row-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.layout-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.layout-row-name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--kds-text);
}

.layout-row-desc {
  font-size: 0.8rem;
  color: var(--kds-text-muted);
  line-height: 1.4;
}

.layout-row-check {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--kds-accent);
  background: rgba(99, 102, 241, 0.1);
  padding: 2px 8px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* ── Custom Switch ── */
.kds-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
}

.kds-switch input { opacity: 0; width: 0; height: 0; }

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--kds-badge-bg);
  transition: .3s;
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
  transition: .3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

input:checked + .slider { background-color: var(--kds-accent); }
input:checked + .slider:before { transform: translateX(22px); }

/* ── Keyboard Map ── */
.keyboard-map {
  background: rgba(0,0,0,0.03);
  padding: 16px;
  border-radius: var(--kds-radius);
  border: 1px dashed var(--kds-card-border);
}

.map-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.key-tag {
  background: var(--kds-surface);
  border: 1px solid var(--kds-card-border);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--kds-accent);
  min-width: 60px;
  text-align: center;
}

.key-function {
  font-size: 0.8rem;
  color: var(--kds-text-muted);
}
</style>
