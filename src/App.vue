<template>
  <div id="kds-app">
    <router-view />
  </div>
</template>

<script>
import { useI18n } from "vue-i18n";
import { onMounted } from "vue";
import axios from "axios";
export default {
  name: "App",
  setup() {
    const { t, locale } = useI18n();

    onMounted(async () => {
      try {
        const res = await axios.post("parametros/getParametros");
        if (res.data && res.data.idiomaTienda) {
          locale.value = res.data.idiomaTienda.toLowerCase();
        }
      } catch (err) {
        console.warn("No se pudo obtener idiomaTienda", err);
      }
    });

    return { t };
  },
};
</script>

<style lang="scss">
@import "@/assets/css/kitchen-theme.scss";

#app,
#kds-app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
