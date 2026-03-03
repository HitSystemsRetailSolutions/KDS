<template>
  <div class="menu-modal-viewport">
    <MDBModalHeader :close="closeBtn" class="modal-header-custom">
      <div class="modal-title-custom">
        <MDBIcon icon="plus-circle" />
        <span> {{ menuSelected?.nombreArticulo || menuSelected?.nombre }}</span>
      </div>
    </MDBModalHeader>
    <MDBModalBody class="modal-body -custom">
      <div class="scrollable-supplements-list">
        <MDBListGroup class="supplements-list">
          <MDBListGroupItem
            v-for="(suplementos, familia) in suplByFamily"
            :key="familia"
          >
            <div class="d-flex align-items-center justify-content-between">
              <h5 class="text-primary familia-header mb-0">{{ familia }}</h5>
              <button
                class="btn btn-link btn-toggle-familia p-0 d-flex align-items-center"
                @click="onToggleFamilia(familia)"
                style="gap: 0.5rem"
              >
                <MDBIcon
                  :icon="familiasAbiertas[familia] ? 'eye-slash' : 'eye'"
                />
                <span>{{
                  familiasAbiertas[familia] ? "Ocultar" : "Mostrar"
                }}</span>
              </button>
            </div>
            <div
              v-if="
                !familiasAbiertas[familia] && seleccionadoPorFamilia[familia]
              "
              class="seleccionado-familia-resumen mb-2"
            >
              <span class="badge bg-primary">
                <MDBIcon icon="check-circle" class="me-1" />
                {{ seleccionadoPorFamilia[familia].nombre }}
              </span>
            </div>
            <div
              v-show="familiasAbiertas[familia]"
              class="suplementos-grid mt-2"
            >
              <div
                v-for="(suplemento, index) in suplementos"
                :key="index"
                class="suplemento-grid-item"
              >
                <button
                  class="btn w-100 h-100 btn-suple-familia"
                  :class="{
                    selected:
                      seleccionadoPorFamilia[familia]?.idArticulo ===
                      (suplemento.idArticulo || suplemento._id),
                  }"
                  @click="onSetSeleccionFamilia(familia, suplemento)"
                  :disabled="suplemento.esSumable === false"
                >
                  <span class="suple-btn-content">
                    <MDBIcon
                      :icon="
                        seleccionadoPorFamilia[familia]?.idArticulo ===
                        (suplemento.idArticulo || suplemento._id)
                          ? 'check-circle'
                          : 'circle'
                      "
                      class="selection-icon-by-family"
                      :class="{
                        selected:
                          seleccionadoPorFamilia[familia]?.idArticulo ===
                          (suplemento.idArticulo || suplemento._id),
                      }"
                    />
                    <span class="suple-btn-nombre">{{
                      suplemento.nombre
                    }}</span>
                  </span>
                  <span v-if="!suplemento.esSumable"
                    >*No aplicable, va a peso</span
                  >
                </button>
              </div>
            </div>
          </MDBListGroupItem>
        </MDBListGroup>
      </div>
    </MDBModalBody>
    <MDBModalFooter
      v-if="!initialSeleccionadoPorFamilia"
      class="modal-footer-custom"
    >
      <MDBBtn
        color="secondary"
        @click="$emit('update:modelValue', false)"
        class="cancel-btn"
      >
        <MDBIcon icon="times" />
        Cancelar
      </MDBBtn>
      <MDBBtn color="success" @click="confirmarMenu" class="confirm-btn">
        <MDBIcon icon="check" />
        Añadir producto
      </MDBBtn>
    </MDBModalFooter>
  </div>
  <SuplementosModal
    v-model="showSuplModal"
    :suplArticle="suplArticle"
    @confirmarSuplementos="onConfirmarSuplementos"
  />
</template>
<script>
import {
  MDBModal,
  MDBModalHeader,
  MDBModalBody,
  MDBModalFooter,
  MDBBtn,
  MDBListGroup,
  MDBListGroupItem,
  MDBIcon,
} from "mdb-vue-ui-kit";
import { ref, watch, toRef, computed, getCurrentInstance } from "vue";
import axios from "axios";
import { useMenuSelection } from "../composables/useMenuSelection";
import SuplementosModal from "./SuplementosModal.vue";
export default {
  name: "MenuModal",
  components: {
    MDBModal,
    MDBModalHeader,
    MDBModalBody,
    MDBModalFooter,
    MDBBtn,
    MDBListGroup,
    MDBListGroupItem,
    MDBIcon,
    SuplementosModal,
  },
  props: {
    modelValue: (Boolean) => true,
    closeBtn: (Boolean) => true,
    menuSelected: Object,
    suplByFamily: Object,
    initialSeleccionadoPorFamilia: Object,
  },
  emits: ["update:modelValue", "confirmarMenu"],
  setup(props, { emit }) {
    // Usar el composable para la lógica de selección
    const suplByFamilyRef = toRef(props, "suplByFamily");
    const {
      familiasAbiertas,
      seleccionadoPorFamilia,
      onToggleFamilia,
      resetSelection,
      initFamilies,
    } = useMenuSelection(suplByFamilyRef);

    // Referencia al modal de suplementos y su estado
    const showSuplModal = ref(false);
    const suplArticle = ref(null);
    const pendingFamilia = ref(null);
    const pendingProducto = ref(null);

    // Computed para v-model compatible
    const modalVisible = computed({
      get: () => props.modelValue,
      set: (val) => emit("update:modelValue", val),
    });

    // Inicializar familias cuando cambian los suplementos
    watch(
      suplByFamilyRef,
      () => {
        initFamilies();
        resetSelection();
      },
      { immediate: true }
    );
    // Inicializar seleccionadoPorFamilia si se pasa initialSeleccionadoPorFamilia
    watch(
      () => props.initialSeleccionadoPorFamilia,
      (val) => {
        if (val && typeof val === "object") {
          resetSelection();
          Object.entries(val).forEach(([familia, art]) => {
            seleccionadoPorFamilia[familia] = art;
            console.log(
              "Inicializado seleccionadoPorFamilia:",
              seleccionadoPorFamilia[familia]
            );
          });
        }
      },
      { immediate: true }
    );

    // Emitir cambios en modo edición con debounce
    const lastSeleccionadoStr = ref(JSON.stringify(seleccionadoPorFamilia));
    watch(
      seleccionadoPorFamilia,
      (val) => {
        if (!props.initialSeleccionadoPorFamilia) return;
        const currentStr = JSON.stringify(val);
        if (currentStr !== lastSeleccionadoStr.value) {
          emit("aplicarCambios", { ...val });
          lastSeleccionadoStr.value = currentStr;
        }
      },
      { deep: true }
    );

    // Selección de suplemento/familia con lógica extendida
    async function onSetSeleccionFamilia(familia, producto) {
      const idSel = seleccionadoPorFamilia[familia]?.idArticulo;
      const idSup = producto.idArticulo ?? producto._id ?? null;

      if (idSel === idSup) {
        // Si ya está seleccionado, deselecciona
        delete seleccionadoPorFamilia[familia];
        return;
      }
      // Consulta el artículo completo
      const { data } = await axios.post("articulos/getArticuloById", {
        idArticulo: producto.idArticulo || producto._id,
      });
      // Si el artículo tiene suplementos
      if (data && data.suplementos && data.suplementos.length > 0) {
        const res = await axios.post("articulos/getSuplementos", {
          arrayIdSuplementos: producto.suplementos,
        });
        // Guardar contexto pendiente y abrir modal de suplementos
        pendingFamilia.value = familia;
        pendingProducto.value = producto;
        suplArticle.value = res.data;
        showSuplModal.value = true;
        return;
      }
      // Si no tiene suplementos, añadir directamente
      const obj = {
        idArticulo: idSup,
        nombre: producto.nombre ?? null,
        arraySuplementos: producto.arraySuplementos ?? null,
        unidades: producto.unidades ?? 1,
        gramos: producto.gramos ?? null,
      };
      seleccionadoPorFamilia[familia] = obj;
      console.log(`Seleccionado directamente :`, seleccionadoPorFamilia);
    }

    // Cuando se confirman suplementos desde el modal hijo
    function onConfirmarSuplementos(suplementosSeleccionados) {
      if (!pendingFamilia.value || !pendingProducto.value) return;
      const idSup =
        pendingProducto.value.idArticulo ?? pendingProducto.value._id ?? null;
      const obj = {
        idArticulo: idSup,
        nombre: pendingProducto.value.nombre ?? null,
        arraySuplementos: suplementosSeleccionados ?? null,
        unidades: pendingProducto.value.unidades ?? 1,
        gramos: pendingProducto.value.gramos ?? null,
      };
      seleccionadoPorFamilia[pendingFamilia.value] = obj;
      // Limpiar estado
      pendingFamilia.value = null;
      pendingProducto.value = null;
      suplArticle.value = null;
      showSuplModal.value = false;
    }

    // Confirmar selección y emitir al padre (modo normal)
    function confirmarMenu() {
      emit("confirmarMenu", seleccionadoPorFamilia);
      emit("update:modelValue", false);
      resetSelection();
    }

    // Aplicar cambios y emitir al padre (modo edición)
    function aplicarCambios() {
      emit("aplicarCambios", seleccionadoPorFamilia);
    }

    return {
      familiasAbiertas,
      seleccionadoPorFamilia,
      onToggleFamilia,
      onSetSeleccionFamilia,
      confirmarMenu,
      modelValue: modalVisible,
      // Para el modal de suplementos
      showSuplModal,
      suplArticle,
      onConfirmarSuplementos,
      aplicarCambios,
    };
  },
};
</script>
<style scoped>
.supplements-modal .modal-header-custom {
  background-color: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
}
.supplements-modal .modal-title-custom {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #495057;
}
.supplements-modal .modal-body-custom {
  background-color: #fff9f2;
  padding: 20px;
  overflow: hidden;
}
.supplements-modal .modal-footer-custom {
  background-color: #f8f9fa;
  border-top: 2px solid #e9ecef;
  gap: 10px;
}
.menu-modal-viewport {
  max-height: 100vh;
  display: flex;
  flex-direction: column;
}
.modal-body-custom {
  flex: 1 1 auto;
  overflow: hidden;
  background-color: #fff9f2;
  padding: 20px;
}
.scrollable-supplements-list {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
}

.btn-suple-familia .suple-btn-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  justify-content: flex-start;
}
.selection-icon-by-family {
  font-size: 1rem;
  color: #dee2e6;
  transition: color 0.3s ease;
}
.selection-icon-by-family.selected {
  color: #007bff;
}
.suple-btn-nombre {
  flex: 1 1 auto;
  text-align: left;
  white-space: normal;
  word-break: break-word;
}
.cancel-btn,
.confirm-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
}
.suplementos-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.suplemento-grid-item {
  width: 100%;
}
@media (min-width: 500px) {
  .suplementos-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 800px) {
  .suplementos-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (min-width: 1100px) {
  .suplementos-grid {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}
</style>
