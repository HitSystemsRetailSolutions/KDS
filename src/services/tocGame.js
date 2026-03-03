import axios from "axios";
import Swal from "sweetalert2";
import router from "../router/index";
import { emitSocket } from "./sockets";
import store from "../store/index";
const baseURL = "http://" + window.location.hostname + ":3000/";

class tocGameV3 {
  /* Eze 4.0 */
  async todoInstalado() {
    try {
      return (await axios.get(baseURL + "parametros/todoInstalado")).data;
    } catch (err) {
      Swal.fire("Oops...", err.message, "error");
      return false;
    }
  }

  /* Eze 4.0 */
  async hayFichados() {
    try {
      return (await axios.get(baseURL + "trabajadores/hayFichados")).data;
    } catch (err) {
      Swal.fire("Oops...", err.message, "error");
      return false;
    }
  }

  /* Eze 4.0 */
  async cajaAbierta() {
    try {
      return (await axios.get(baseURL + "caja/estadoCaja")).data;
    } catch (err) {
      Swal.fire("Oops...", err.message, "error");
      return false;
    }
  }

  /* Eze 4.0 */
  async getParametros() {
    try {
      return (await axios.post(baseURL + "parametros/getParametros")).data;
    } catch (err) {
      Swal.fire("Oops...", err.message, "error");
      return null;
    }
  }

  /* Eze 4.0 */
  async iniciarToc() {
    if (await this.todoInstalado()) {
      if (await this.hayFichados()) {
        let abierto = await this.cajaAbierta();
        if (abierto == 1) {
          router.push("/employer").then((r) => {
            Swal.fire(
              "Caja cerrada automáticamente.",
              "La caja de ayer se ha cerrado automáticamente debido a que no se cerró.",
              "error"
            );
          });
        } else if (abierto == 3) {
          await router.push("/employer");
        } else {
          await router.push("/employer");
        }
      } else {
        router.push("/employer");
      }
    } else {
      router.push("/employer");
    }
  }

  /* Eze 4.0 */
  cargarTrabajadoresFichados = () => emitSocket("cargarTrabajadores");

  /* Uri */
  cargarConfigurador = () => emitSocket("cargarConfigurador");

  /* Eze 4.0 */
  cargarCestas = () => emitSocket("cargarCestas");

  /* Eze 4.0 */
  cargarConfiguracion = () => emitSocket("cargarConfiguracion");

  /* Eze 4.0 */
  recargarPromosCache = () => emitSocket("recargarPromociones");

  /* Eze 4.0 */
  cargarVentas = () => emitSocket("cargarVentas");

  /* Eze 4.0 */
  cargarTeclado = () => emitSocket("cargarTeclado");
}

export const tocGame = new tocGameV3();

// setInterval(async () => {
//   if (
//     router.currentRoute.value.path != "/abrirCaja" &&
//     router.currentRoute.value.path != "/installWizard"
//   ) {
//     if (!(await tocGame.cajaAbierta())) {
//       router.push("/abrirCaja");
//     }
//   }
// }, 3000);
