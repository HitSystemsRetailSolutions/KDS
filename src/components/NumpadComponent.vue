<template>
  <div class="btn-group-vertical mt-1">
    <div class="btn-group">
      <button
        type="button"
        class="btn btn-outline-secondary py-3 botonNumpad"
        @click="addTecla('1')"
      >
        1
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary py-3 botonNumpad"
        @click="addTecla('2')"
      >
        2
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary py-3 botonNumpad"
        @click="addTecla('3')"
      >
        3
      </button>
    </div>
    <div class="btn-group">
      <button
        type="button"
        class="btn btn-outline-secondary py-3 botonNumpad"
        @click="addTecla('4')"
      >
        4
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary py-3 botonNumpad"
        @click="addTecla('5')"
      >
        5
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary py-3 botonNumpad"
        @click="addTecla('6')"
      >
        6
      </button>
    </div>
    <div class="btn-group">
      <button
        type="button"
        class="btn btn-outline-secondary py-3 botonNumpad"
        @click="addTecla('7')"
      >
        7
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary py-3 botonNumpad"
        @click="addTecla('8')"
      >
        8
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary py-3 botonNumpad"
        @click="addTecla('9')"
      >
        9
      </button>
    </div>
    <div class="btn-group">
      <button
        type="button"
        class="btn btn-outline-secondary py-3 botonNumpad"
        @click="deleteTecla()"
      >
        &lt;
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary py-3 botonNumpad"
        @click="addTecla('0')"
      >
        0
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary py-3 botonNumpad"
        @click="okValue(Number(cantidad))"
      >
        OK
      </button>
    </div>
    <div class="btn-group">
      <button
        type="button"
        class="btn btn-outline-secondary py-3 botonComa"
        @click="addTecla('.')"
      >
        ,
      </button>
    </div>
  </div>
</template>

<script>
import { ref, inject, onMounted } from "vue";
export default {
  name: "NumpadComponent",
  setup(_props, { expose }) {
    const cantidad = ref("0");
    const okValue = inject("okValue");
    const anchoTecla = ref("5.5rem");
    const altoTecla = ref("5.5rem");

    function addTecla(x) {
      if (x === ".") cantidad.value = cantidad.value.replace(".", "");
      cantidad.value += x;
      if (cantidad.value[0] == "0") cantidad.value = cantidad.value.slice(1);
    }

    function deleteTecla() {
      cantidad.value = cantidad.value.slice(0, -1);
      if (cantidad.value === "") cantidad.value = "0";
    }

    function setValor(aLaVez) {
      cantidad.value = Number(aLaVez).toString();
    }

    expose({
      cantidad,
      setValor,
    });

    return {
      okValue,
      cantidad,
      addTecla,
      deleteTecla,
      setValor,
      anchoTecla,
      altoTecla,
    };
  },
};
</script>

<style lang="scss" scoped>
/* $anchoTecla: v-bind("anchoTecla");
$altoTecla: 5.5rem;
$sizeFuente: 2.5rem; */
.botonNumpad {
  min-width: 5.5rem;
  max-width: 5.5rem;
  min-height: 5.5rem;
  max-height: 5.5rem;
  font-size: 2.5rem;
  font-weight: bold;
  color: #606060 !important;
}
.botonComa {
  min-width: 16.25rem;
  max-width: 16.25rem;
  min-height: 4rem;
  max-height: 4rem;
  font-size: 2rem;
  font-weight: bold;
  color: #606060 !important;
}
</style>
