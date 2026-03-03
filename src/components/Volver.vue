<template>
  <div class="input-group position-absolute bottom-0 start-0">
    <button
      @click="volver()"
      class="btn btn-warning ms-2"
      style="font-size: 27px"
    >
      {{ $t("volver", "VOLVER") }}
    </button>
  </div>
</template>

<script>
import router from "../router/index";

export default {
  name: "VolverComponent",
  setup() {
    function volver() {
      router.back();
    }
    return {
      volver,
    };
  },
};
</script>

<style lang="scss" scoped></style>
