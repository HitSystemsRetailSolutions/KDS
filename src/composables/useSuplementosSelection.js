// Composable para la lógica de selección de suplementos
import { ref, watch } from "vue";

export function useSuplementosSelection(suplArticle) {
  // Estado local reactivo para los suplementos
  const localSuplArticle = ref([]);

  // Sincroniza el estado local con el prop
  watch(
    suplArticle,
    (val) => {
      localSuplArticle.value = val ? val.map((s) => ({ ...s })) : [];
    },
    { immediate: true }
  );

  // Alternar selección
  function toggleSuplemento(x) {
    x.selected = !x.selected;
  }

  // Obtener seleccionados
  function getSeleccionados() {
    return localSuplArticle.value.filter((s) => s.selected);
  }

  // Resetear selección
  function resetSelection() {
    localSuplArticle.value.forEach((s) => (s.selected = false));
  }

  return {
    localSuplArticle,
    toggleSuplemento,
    getSeleccionados,
    resetSelection,
  };
}
