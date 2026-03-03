import { io } from "socket.io-client";
import store from "../store/index";
import router from "../router/index";
import Swal from "sweetalert2";
import { data } from "autoprefixer";
const socket = io("http://" + store.state.TocGameURL + ":5051");

/* 
socket.on("cargarConfiguracion", (parametros) => {
  try {
    if (parametros) {
      store.dispatch("Configuracion/setParametros", parametros);
    } else {
      //throw Error("Error, parametros no es correcto");
    }
  } catch (err) {
    Swal.fire("Oops...", err.message, "error");
  }
});
*/
/* Uri */
socket.on("cargarTrabajadores", (arrayTrabajadores) => {
  try {
    if (arrayTrabajadores) {
      store.dispatch("Employers/setArrayEmployersMutation", arrayTrabajadores);
    } else {
      throw Error("Error, arrayTrabajadores no es correcto");
    }
  } catch (err) {
    Swal.fire("Oops...", err.message, "error");
  }
});

/* Uri */
socket.on("cargarCestas", (arrayCestas) => {
  try {
    if (arrayCestas) {
      store.dispatch("Tables/arrayTablesMutation", arrayCestas);
    } else {
      throw Error("Error, arrayCestas no es correcto");
    }
  } catch (err) {
    Swal.fire("Oops...", err.message, "error");
  }
});

/* Uri 
socket.on("cargarVentas", (arrayTickets) => {
  try {
    if (arrayTickets) {
      store.dispatch("Caja/setArrayVentas", arrayTickets);
    } else {
      throw Error("Error, arrayTickets no es correcto");
    }
  } catch (err) {
    Swal.fire("Oops...", err.message, "error");
  }
});
*/
/* Uri */
socket.on("cargarTeclado", (teclado) => {
  try {
    if (teclado) {
      store.dispatch("Categories/setArrayCategoriesMutation", teclado);
    } else {
      throw Error("Error, teclado no es correcto");
    }
  } catch (err) {
    Swal.fire("Oops...", err.message, "error");
  }
});

socket.on("disconnect", () => {
  socket.sendBuffer = [];
});

socket.on("test", (data) => {
  data;
});

socket.on("resDatafono", (data) => {
  data;
});

socket.on("resConsultaPuntos", (data) => {
  if (data.error == false) {
    Swal.fire({
      icon: "info",
      text: `Puntos del cliente: ${data.info}`,
    });
  } else {
    Swal.fire("Oops...", data.mensaje, "error");
  }
});

socket.on("consultaPaytef", (data) => {
  if (data) {
    store.dispatch("Datafono/setEstado", "APROBADA");
  } else {
    store.dispatch("Datafono/setEstado", "DENEGADA");
    setTimeout(() => {
      store.dispatch("Datafono/setEstado", "AGAIN");
    }, 3000);
  }
});

socket.on("procesoPaytef", (data) => {
  if (data) {
    store.dispatch("Datafono/setProceso", data.proceso);
  } else {
    store.dispatch("Datafono/setProceso", "");
  }
});

socket.on("consultaPaytefRefund", (data) => {
  if (data.ok) {
    Swal.fire("OK", "Devolución aceptada", "success");
  }
});

socket.on("nuevoTrabajadorActivo", (data) => {
  if (data.id) {
    store.dispatch("Trabajadores/setNuevoActivo", data.id);
  }
});

socket.on("resDatafono", (data) => {
  store.dispatch("setEsperandoDatafono", false);
  if (data.error == false) {
    store.dispatch("Cestas/setIdAction", -1);
    store.dispatch("setModoActual", "NORMAL");
    store.dispatch("Clientes/resetClienteActivo");
    store.dispatch("Footer/resetMenuActivo");
    router.push({
      name: "Home",
      params: { tipoToast: "success", mensajeToast: "Ticket creado" },
    });
  } else {
    Swal.fire("Oops...", data.mensaje, "error");
  }
});

// socket.on("ponerImagen", async (data) => {
//   const image = document.createElement("img");
//   image.src = require("./imagen");
//   image.setAttribute(
//     "style",
//     "position: absolute; top: 0px; left: 0px; width: 20vmin;z-index: 2000;"
//   );
//   document.body.appendChild(image);
// });

function emitSocket(canal, datos = null) {
  if (socket.connected) {
    socket.emit(canal, datos);
  }
}

export { socket, emitSocket };
