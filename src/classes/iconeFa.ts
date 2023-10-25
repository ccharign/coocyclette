import L from "leaflet";


type Couleur = "blue" | "purple" | "green" | "red" | "darkred" | "orange" | "darkgreen" | "darkpurple" | "cadetblue";


export function sansIcone(couleur: Couleur) {
    return iconeFa("", couleur);
}


export function iconeFa(nom: string = "", couleur: Couleur = "blue") {
    return L.AwesomeMarkers.icon({
        icon: nom,
        prefix: "fa",
        markerColor: couleur,
    });
}
