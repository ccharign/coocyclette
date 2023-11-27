import Lieu, { géomOsmVersLeaflet } from "./Lieu";
import { GetItinéraire } from "./types";
import L from "leaflet";
import lieuOfJson from "../fonctions/crée-lieu";
import type { Étapes } from "../hooks/useÉtapes"


// Efface les anciens itinéraires et affiche les nouveaux
// itis: résultat du get
// itinéraires: les itinéraires de l’appli
export function màjItinéraires(itis: GetItinéraire[], carte: L.Map, itinéraires: Itinéraire[], étapes: Étapes) {

    itinéraires.forEach(
        iti => iti.supprimeLayers()
    );
    itinéraires.length = 0;
    itis.forEach(
        iti => itinéraires.push(new Itinéraire(iti, carte, étapes))
    );
}


// Représente le résultat d’un calcul d’itinéraire
export class Itinéraire {


    couleur: string
    pourcentage_détour: number
    longueur: number // en km
    polyline: L.Polyline
    lieux: Lieu[]


    constructor({ points, couleur, pourcentage_détour, lieux, longueur, nom }: GetItinéraire, carte: L.Map, étapes: Étapes) {

        this.couleur = couleur;
        this.longueur = longueur;
        this.pourcentage_détour = pourcentage_détour;
        this.lieux = lieux.map(l => lieuOfJson(l, carte, étapes)) as Lieu[];
        this.lieux.forEach(
            l => l.leaflet_layer.addTo(carte)
        )

        const contenu_popup = `
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
            .bindPopup(
                contenu_popup,
                {
                    //permanent: true,
                }
            )
            .addTo(carte);
    }


    // Supprime les éventuels marqueurs de lieu et la polyline liés à l’itinéraire
    supprimeLayers() {
        this.lieux.map(
            l => l.leaflet_layer.remove()
        );
        this.polyline.remove();
    }

}
