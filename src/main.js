import "mdb-vue-ui-kit/css/mdb.min.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import { i18n, setupI18n } from "./i18n";
import { version } from "../package.json";
require("./services/sockets");
axios.defaults.baseURL = "http://" + window.location.hostname + ":3000";

// Report version to backend
axios.post("getInfo/actualizarVersionKds", { version }).catch(() => {
  /* Silent error */
});

async function initApp() {
  await setupI18n();
  createApp(App).use(store).use(router).use(i18n).mount("#app");
}
initApp();
