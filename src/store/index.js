import { createStore } from "vuex";
import Employers from "./Employers";
import Tables from "./Tables";
import Categories from "./Categories&products.js";
export default createStore({
  state: {
    vistaEspecial: false,
    modoActual: "NORMAL",
    TocGameURL: window.location.hostname,
  },
  getters: {
    getModoActual: (state) => state.modoActual,
    getTocGame: (state) => state.TocGameURL,
  },
  mutations: {
    setModoActualMutation(state, payload) {
      state.modoActual = payload;
    },
    setTocGameURLMutation(state, payload) {
      state.TocGameURL = payload;
    },
  },
  actions: {
    setModoActual({ commit }, payload) {
      commit("setModoActualMutation", payload);
    },
    setTocGameURL({ commit }, payload) {
      commit("setTocGameURLMutation", payload);
    },
  },
  modules: {
    Employers,
    Tables,
    Categories,
  },
});
