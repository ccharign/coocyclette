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
        let contenu_popup = `
${nom}<br>${longueur}km, ${Math.floor(longueur / 0.25)}mn`
            + (pourcentage_détour ? `,<br> détour de ${pourcentage_détour}%` : "");
        //contenu_popup = `<div stlyle="background-color: ${this.couleur}">${contenu_popup}</div>`
        
        this.polyline = new L.Polyline(
            géomOsmVersLeaflet(points),
            {
                color: couleur,
                weight: 7,
                opacity: .6,
                lineJoin: "miter",
            }
        )
            .bindTooltip(
                contenu_popup,
                {
                    //permanent: true,
                }
            )
            .on("click",
                e => {
                    e.originalEvent.stopPropagation();
                    e.originalEvent.stopImmediatePropagation();
                    this.polyline.toggleTooltip();
                }
            );

    }
}
