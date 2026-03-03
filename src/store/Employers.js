import axios from "axios";
import Swal from "sweetalert2";
import router from "@/router";
export default {
  namespaced: true,
  state: {
    arrayEmployers: [],
    selectedEmployer: null,
  },
  mutations: {
    setArrayEmployersMutation(state, payload) {
      state.arrayEmployers = payload;
    },
    async setEmployer(state, payload) {
      state.selectedEmployer = payload;
      await router.push("/tableselection");
    },
  },
  getters: {
    getEmployers: (state) => state.arrayEmployers,
    getSelectedEmployer: (state) => state.selectedEmployer,
  },
  actions: {
    setArrayEmployersMutation({ commit }, data) {
      commit("setArrayEmployersMutation", data);
    },
    setSelectedEmployer({ commit }, data) {
      commit("setEmployer", data);
    },
  },
};
