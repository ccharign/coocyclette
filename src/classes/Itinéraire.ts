import { géomOsmVersLeaflet } from "./lieux";
import { GetItinéraire } from "./types";
import L from "leaflet";


// Représente le résultat d’un calcul d’itinéraire
export class Itinéraire {

    couleur: string
    pourcentage_détour: number
    longueur: number // en km
    polyline: L.Polyline

    constructor({ points, couleur, pourcentage_détour, longueur, nom }: GetItinéraire) {

        this.couleur = couleur;
        this.longueur = longueur;
        this.pourcentage_détour = pourcentage_détour;
        const contenu_popup = `${nom}<br>${longueur}km, ${Math.floor(longueur / 0.25)}mn`
            + (pourcentage_détour ? `,<br> détour de ${pourcentage_détour}%` : "");

        this.polyline = new L.Polyline(
            géomOsmVersLeaflet(points),
            {
                color: couleur,
                weight: 7,
                opacity: .6,
                lineJoin: "miter",
            }
        )
            .bindPopup(contenu_popup);

    }
}
