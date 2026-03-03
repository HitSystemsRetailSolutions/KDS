<template>
  <MDBModal
    id="suplModal"
    tabindex="-1"
    labelledby="suplModal"
    v-model="modelValue"
    :staticBackdrop="true"
    size="lg"
    class="supplements-modal"
  >
    <MDBModalHeader class="modal-header-custom">
      <div class="modal-title-custom">
        <MDBIcon icon="plus-circle" />
        <span>Seleccionar suplementos</span>
      </div>
    </MDBModalHeader>
    <MDBModalBody class="modal-body-custom">
      <MDBListGroup class="supplements-list">
        <MDBListGroupItem
          v-for="(x, y) in localSuplArticle"
          :key="y"
          @click="toggleSuplemento(x)"
          class="supplement-item"
          :class="{ 'supplement-selected': x.selected }"
        >
          <div class="supplement-content">
            <div class="supplement-info">
              <MDBIcon
                :icon="x.selected ? 'check-circle' : 'circle'"
                class="selection-icon"
                :class="{ selected: x.selected }"
              />
              <span class="supplement-name">{{ x.nombre }}</span>
            </div>
            <span class="supplement-price">{{ x.precioConIva }}€</span>
          </div>
        </MDBListGroupItem>
      </MDBListGroup>
    </MDBModalBody>
    <MDBModalFooter class="modal-footer-custom">
      <MDBBtn
        color="secondary"
        @click="$emit('update:modelValue', false)"
        class="cancel-btn"
      >
        <MDBIcon icon="times" />
        Cancelar
      </MDBBtn>
      <MDBBtn color="success" @click="confirmarSuplementos" class="confirm-btn">
        <MDBIcon icon="check" />
        Confirmar selección
      </MDBBtn>
    </MDBModalFooter>
  </MDBModal>
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
import { toRef, computed } from "vue";
import { useSuplementosSelection } from "../composables/useSuplementosSelection";

export default {
  name: "SuplementosModal",
  components: {
    MDBModal,
    MDBModalHeader,
    MDBModalBody,
    MDBModalFooter,
    MDBBtn,
    MDBListGroup,
    MDBListGroupItem,
    MDBIcon,
  },
  props: {
    modelValue: Boolean,
    suplArticle: Array,
  },
  emits: ["update:modelValue", "confirmarSuplementos"],
  setup(props, { emit }) {
    const suplArticleRef = toRef(props, "suplArticle");
    const {
      localSuplArticle,
      toggleSuplemento,
      getSeleccionados,
      resetSelection,
    } = useSuplementosSelection(suplArticleRef);

    // Computed para v-model compatible
    const modalVisible = computed({
      get: () => props.modelValue,
      set: (val) => emit("update:modelValue", val),
    });

    function confirmarSuplementos() {
      emit("confirmarSuplementos", getSeleccionados());
      emit("update:modelValue", false);
      resetSelection();
    }

    return {
      localSuplArticle,
      toggleSuplemento,
      confirmarSuplementos,
      modelValue: modalVisible,
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
}
.supplements-modal .modal-footer-custom {
  background-color: #f8f9fa;
  border-top: 2px solid #e9ecef;
  gap: 10px;
}
.supplements-list {
  background-color: transparent;
}
.supplement-item {
  background-color: #ffffff;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  cursor: pointer;
  transition: all 0.3s ease;
}
.supplement-item:hover {
  border-color: #007bff;
  transform: translateY(-1px);
}
.supplement-item.supplement-selected {
  background-color: #e7f3ff;
  border-color: #007bff;
}
.supplement-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
}
.supplement-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.selection-icon {
  font-size: 1.3rem;
  color: #dee2e6;
  transition: color 0.3s ease;
}
.selection-icon.selected {
  color: #007bff;
}
.supplement-name {
  font-size: 1rem;
  color: #333;
}
.supplement-price {
  font-size: 1rem;
  font-weight: bold;
  color: #28a745;
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
</style>
