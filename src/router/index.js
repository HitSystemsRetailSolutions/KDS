import { createRouter, createWebHistory } from "vue-router";
import KitchenBoard from "../modules/kitchen/views/KitchenBoard.vue";

const routes = [
  {
    path: "/",
    name: "KitchenBoard",
    component: KitchenBoard,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
