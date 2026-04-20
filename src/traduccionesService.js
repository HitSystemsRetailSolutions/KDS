export const getTraducciones = (force = false) => {
    return fetch(
        "http://" + window.location.hostname + ":3000/traducciones/getTraducciones" + (force ? "?force=true" : "")
    )
        .then((response) => response.json())
        .then((data) => data);
};
