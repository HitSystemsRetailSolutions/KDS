<template>
  <div id="kds-app">
    <router-view />
  </div>
</template>

<script>
import { useI18n } from "vue-i18n";
export default {
  name: "App",
  setup() {
    const { t } = useI18n();
    return { t };
  },
};
</script>

<style lang="scss">
@import "@/assets/css/kitchen-theme.scss";

#app, #kds-app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
