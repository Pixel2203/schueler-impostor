/**
 *
 * @param text {string}
 */
function erstelleListenelement(text) {
    const li =  document.createElement("li")
    li.textContent = text;
    return li;

}

/**
 *
 * @param liste {HTMLUListElement}
 */
function leereListe(liste) {
    liste.innerHTML = "";
}