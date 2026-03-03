// Composable para la lógica de selección de menús y suplementos por familia
import { ref, reactive } from "vue";

export function useMenuSelection(suplByFamily) {
  // Estado reactivo para familias abiertas y selección por familia
  const familiasAbiertas = reactive({});
  // Empieza vacío, solo se añaden familias seleccionadas
  const seleccionadoPorFamilia = reactive({});

  // Inicializa solo familias abiertas
  function initFamilies() {
    Object.keys(suplByFamily.value || {}).forEach((familia) => {
      if (!(familia in familiasAbiertas)) familiasAbiertas[familia] = false;
    });
    // No tocar seleccionadoPorFamilia aquí
  }

  // Alternar visibilidad de familia
  function onToggleFamilia(familia) {
    familiasAbiertas[familia] = !familiasAbiertas[familia];
  }

  // Seleccionar suplemento para una familia
  function onSetSeleccionFamilia(familia, producto) {
    const idSel = seleccionadoPorFamilia[familia]?.idArticulo;
    const idSup = producto.idArticulo ?? producto._id ?? null;
    if (idSel === idSup) {
      // Si ya está seleccionado, deselecciona
      delete seleccionadoPorFamilia[familia];
      return;
    }

    const obj = {
      idArticulo: idSup,
      nombre: producto.nombre ?? null,
      arraySuplementos: producto.arraySuplementos ?? null,
      unidades: producto.unidades ?? 1,
      gramos: producto.gramos ?? null,
    };
    seleccionadoPorFamilia[familia] = obj;
  }

  // Resetear selección
  function resetSelection() {
    console.log("Reseteando selección de menús y suplementos");
    Object.keys(seleccionadoPorFamilia).forEach(
      (f) => delete seleccionadoPorFamilia[f]
    );
    Object.keys(familiasAbiertas).forEach((f) => (familiasAbiertas[f] = false));
  }

  return {
    familiasAbiertas,
    seleccionadoPorFamilia,
    onToggleFamilia,
    onSetSeleccionFamilia,
    resetSelection,
    initFamilies,
  };
}
