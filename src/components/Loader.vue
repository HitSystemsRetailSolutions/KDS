<template>
  <div
    class="vh-100"
    style="
      background-color: #1d1d1d;
      position: absolute;
      width: 100vw;
      top: 0;
      left: 0;
    "
  >
    <span class="loadingInfo">Estamos cargando la información...</span>
    <div style="margin-top: 90%">
      <div class="pac-man"></div>
    </div>
  </div>
</template>

<script>
import { tocGame } from "../services/tocGame";
export default {
  name: "LoaderComponent",
  setup() {
    setTimeout(function () {
      tocGame.cargarConfiguracion();
      tocGame.recargarPromosCache();
      tocGame.cargarCestas();
      tocGame.cargarVentas();
      tocGame.cargarTeclado();
      tocGame.cargarTrabajadoresFichados();
      tocGame.cargarConfigurador();
      tocGame.iniciarToc();
    }, 4000);
    return {};
  },
};
</script>

<style lang="scss" scoped>
.loadingInfo {
  color: white;
  margin-left: 2%;
  font-size: 0.7rem;
}
.pac-man {
  border-radius: 50%;
  margin: 0 auto;
  margin-top: 5em;
  border-radius: 100em 100em 0 0;
  background: #f00;
  transform-origin: bottom;
  -webkit-animation: eating-top 0.5s infinite;
  animation: eating-top 0.5s infinite;
}
.pac-man,
.pac-man::before {
  width: 60px;
  height: calc(70px / 2);
  background: #fed75a;
}
.pac-man::before {
  content: "";
  display: block;
  margin-top: calc(60px / 2);
  position: absolute;
  transform-origin: top;
  border-radius: 0 0 100em 100em;
  transform: rotate(80deg);
  -webkit-animation: eating-bottom 0.5s infinite;
  animation: eating-bottom 0.5s infinite;
}
.pac-man::after {
  position: absolute;
  border-radius: 100em;
  content: "";
  display: block;
  height: 20px;
  width: 20px;
  margin-top: calc((60px / 2) - 10px);
  margin-left: calc((60px / 2) - 10px);
  transform-origin: center;
  -webkit-animation: center 0.5s infinite, ball 0.5s -0.33s infinite linear;
  animation: center 0.5s infinite, ball 0.5s -0.33s infinite linear;
}
@-webkit-keyframes eating-top {
  0% {
    transform: rotate(-40deg);
  }
  50% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-40deg);
  }
}
@keyframes eating-top {
  0% {
    transform: rotate(-40deg);
  }
  50% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-40deg);
  }
}
@-webkit-keyframes eating-bottom {
  0% {
    transform: rotate(80deg);
  }
  50% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(80deg);
  }
}
@keyframes eating-bottom {
  0% {
    transform: rotate(80deg);
  }
  50% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(80deg);
  }
}
@-webkit-keyframes center {
  0% {
    transform: rotate(40deg);
  }
  50% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(40deg);
  }
}
@keyframes center {
  0% {
    transform: rotate(40deg);
  }
  50% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(40deg);
  }
}
@-webkit-keyframes ball {
  0% {
    opacity: 0.7;
    box-shadow: 70px 0 0 0 #fed75a, 120px 0 0 0 #fed75a, 170px 0 0 0 #fed75a,
      220px 0 0 0 #fed75a;
  }
  100% {
    box-shadow: 20px 0 0 0 #fed75a, 70px 0 0 0 #fed75a, 120px 0 0 0 #fed75a,
      170px 0 0 0 #fed75a;
  }
}
@keyframes ball {
  0% {
    opacity: 0.7;
    box-shadow: 70px 0 0 0 #fed75a, 120px 0 0 0 #fed75a, 170px 0 0 0 #fed75a,
      220px 0 0 0 #fed75a;
  }
  100% {
    box-shadow: 20px 0 0 0 #fed75a, 70px 0 0 0 #fed75a, 120px 0 0 0 #fed75a,
      170px 0 0 0 #fed75a;
  }
}
</style>
