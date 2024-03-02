import Lieu, { géomOsmVersLeaflet } from "./Lieu";
import { GetItinéraire } from "./types";
import L from "leaflet";
import lieuOfJson from "../fonctions/crée-lieu";
import type { Étapes } from "../hooks/useÉtapes"
import { ReactNode } from "react";


// Efface les anciens itinéraires et affiche les nouveaux
// itis: résultat du get
// itinéraires: les itinéraires de l’appli
export function màjItinéraires(
    itis: GetItinéraire[], carte: L.Map, itinéraires: Itinéraire[], étapes: Étapes, setStats: React.Dispatch<React.SetStateAction<ReactNode>>
) {

    itinéraires.forEach(
        iti => iti.supprimeLayers()
    );
    itinéraires.length = 0;
    itis.forEach(
        iti => itinéraires.push(new Itinéraire(iti, carte, étapes))
    );

    setStats(
        <ul>
            {itinéraires.map(
                iti =>
                    <li key={iti.nom}>
                        {iti.stats()}
                    </li>
            )}
        </ul>
    );
}


// Représente le résultat d’un calcul d’itinéraire
export class Itinéraire {


    couleur: string
    pourcentage_détour: number
    longueur: number // en km
    polyline: L.Polyline
    lieux: Lieu[]
    nom: string


    constructor({ points, couleur, pourcentage_détour, lieux, longueur, nom }: GetItinéraire, carte: L.Map, étapes: Étapes) {

        this.couleur = couleur;
        this.longueur = longueur;
        this.pourcentage_détour = pourcentage_détour;
        this.lieux = lieux.map(l => lieuOfJson(l, carte, étapes)) as Lieu[];
        this.lieux.forEach(
            l => l.leaflet_layer.addTo(carte)
        )
        this.nom = nom;

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
                this.stats_str()
            )
            .addTo(carte);
    }

    stringPourcentageDétour() {
        return this.pourcentage_détour
            ? `détour de ${this.pourcentage_détour}%`
            : "trajet direct"
    }

    // Renvoie les stats de l’itinéraire dans un élément jsx.
    stats() {
        return (
            <span style={{ color: this.couleur }}>
                {this.nom} : {this.longueur}km, {Math.floor(this.longueur / 0.25)}mn, {this.stringPourcentageDétour()}
            </span>
        );
    }

    // Renvoie les stats de l’itinéraire dans un string au format html
    stats_str(): string {
        return `<span style="color:${this.couleur}">
                ${this.nom} :<br> ${this.longueur}km, ${Math.floor(this.longueur / 0.25)}mn, ${this.stringPourcentageDétour()}
            </span>`;
    }


    // Supprime les éventuels marqueurs de lieu et la polyline liés à l’itinéraire
    supprimeLayers() {
        this.lieux.map(
            l => l.leaflet_layer.remove()
        );
        this.polyline.remove();
    }

}
