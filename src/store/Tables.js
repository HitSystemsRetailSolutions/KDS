import axios from "axios";
import Swal from "sweetalert2";
import Employers from "./Employers";
export default {
  namespaced: true,
  state: {
    arrayTables: [],
    rawBaskets: [],
    indexTable: null,
    selectedTable: [],
    mesas: [],
    salas: [],
    salaId: 'MESAS',
  },
  mutations: {
    setSalas(state, payload) {
      state.salas = payload;
    },
    setSalasId(state, payload) {
      state.salasId = payload;
    },
    setSalaId(state, payload) {
      state.salaId = payload;
    },
    setMesas(state, payload) {
      state.mesas = payload;
    },
    arrayTables(state, payload) {
      state.rawBaskets = payload;

      const currentRoomBaskets = payload.filter(
        (basket) => basket.salaId === state.salaId
      );

      const activeMesas = state.mesas.filter(
        (m) => m.nombre && m.nombre.trim() !== ""
      );

      const combinedTables = activeMesas.map((mesaDef) => {
        let activeBasket = currentRoomBaskets.find(
          (basket) => basket.indexMesa == mesaDef._id
        );

        if (activeBasket) {
          activeBasket = { ...activeBasket, nombre: mesaDef.nombre };

          const previousTableState = state.arrayTables.find(
            (t) => t.indexMesa == mesaDef._id
          );

          if (previousTableState && previousTableState.lista) {
            activeBasket.lista = activeBasket.lista.map((newItem) => {
              const previousItem = previousTableState.lista.find(
                (p) =>
                  p.idArticulo === newItem.idArticulo &&
                  JSON.stringify(p.arraySuplementos) ===
                  JSON.stringify(newItem.arraySuplementos)
              );

              if (previousItem) {
                newItem.printed = newItem.printed ?? previousItem.printed ?? 0;
              }
              return newItem;
            });
          }
          return activeBasket;
        } else {
          return {
            _id: null,
            indexMesa: mesaDef._id,
            nombre: mesaDef.nombre,
            salaId: state.salaId,
            lista: [],
          };
        }
      });

      state.arrayTables = combinedTables;

      if (state.indexTable != null) {
        const found = state.arrayTables.find(
          (x) => x.indexMesa == state.indexTable
        );
        state.selectedTable = found || [];
      }
    },
    setTable(state, payload) {
      state.selectedTable = payload;
      state.indexTable = payload.indexMesa;
    },
    addProduct(state, payload) { },
    removeProduct(state, payload) {
      axios
        .post("cestas/borrarItemCesta", {
          idCesta: state.selectedTable._id,
          index: payload,
        })
        .then((resDelete) => {
          if (!resDelete.data) {
            throw Error("No se ha podido eliminar el artículo de la cesta");
          } else {
            state.selectedTable.lista.splice(payload, 1);
          }
        })
        .catch((err) => {
          // Silent error or handling without console log if requested
        });
    },
  },
  getters: {
    getSalas: (state) => state.salas,
    getTables: (state) => state.arrayTables,
    getSelectedTable: (state) => state.selectedTable,
  },
  actions: {
    async arrayTablesMutation({ commit, state, dispatch }, data) {
      if (state.mesas.length === 0) {
        await dispatch("fetchMesas", state.salaId);
      }
      commit("arrayTables", data);
    },
    async setTable({ commit, state }, payload) {
      commit("setTable", payload);
      try {
        await axios.post("cestas/cambiarCestaTrabajador", {
          idCesta: state.selectedTable._id,
          idTrabajador: Employers.state.selectedEmployer._id,
        });
      } catch (error) {
        // Error hidden
      }
    },
    setSelectedTable({ dispatch }, data) {
      dispatch("setTable", data);
    },
    setSalasId({ commit }, data) {
      commit("setSalasId", data);
    },
    addProduct({ commit }, data) {
      commit("addProduct", data);
    },
    removeProduct({ commit }, data) {
      commit("removeProduct", data);
    },
    async fetchSalas({ commit }) {
      try {
        const res = await axios.get("mesas/getSalas");
        if (res.data) commit("setSalas", res.data);
      } catch (e) {
        // Error hidden
      }
    },
    async fetchMesas({ commit, state }, salaId) {
      try {
        const res = await axios.get("mesas/getMesas", {
          params: { salaId: salaId || state.salaId },
        });
        commit("setMesas", res.data);
        commit("setSalaId", salaId || state.salaId);

        if (state.rawBaskets && state.rawBaskets.length > 0) {
          commit("arrayTables", state.rawBaskets);
        }
      } catch (error) {
        // Error hidden
      }
    },
  },
};
