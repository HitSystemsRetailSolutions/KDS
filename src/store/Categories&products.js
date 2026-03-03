import axios from "axios";
import Swal from "sweetalert2";
import router from "@/router";
export default {
  namespaced: true,
  state: {
    arrayCategories: [],
    arrayProducts: null,
    selectedCategory: null,
  },
  mutations: {
    setArrayCategoriesMutation(state, payload) {
      state.arrayCategories = payload;
    },
    setSelectedCategoryMutation(state, payload) {
      state.selectedCategory = payload;
    },
  },
  getters: {
    getCategories: (state) => state.arrayCategories,
  },
  actions: {
    setArrayCategoriesMutation({ commit }, data) {
      commit("setArrayCategoriesMutation", data);
    },
    setSelectedCategoryMutation({ commit }, data) {
      commit("setSelectedCategoryMutation", data);
    },
  },
};

async function processSubMenu() {}
