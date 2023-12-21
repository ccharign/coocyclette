
import L from "leaflet"
import "leaflet.awesome-markers/dist/leaflet.awesome-markers";
//import "leaflet.icon.glyph/Leaflet.Icon.Glyph"

import { GéométrieOsm } from "./types.ts";
import markerIcon from "../../node_modules/leaflet/dist/images/marker-icon.png";
import { iconeFa } from "./iconeFa.ts";
import type { Étapes } from "../hooks/useÉtapes.ts";

type TypeÉtapeDjango = "lieu" | "gtl" | "arête" | "rue";

// Pour envoyer au serveur
export type PourDjango = {
    type_étape: TypeÉtapeDjango,
    pk?: number,
    num?: boolean,
    lon?: number,
    lat?: number,
    adresse?: string,
}


// Charger l’icone de base pour les marqueurs
L.Marker.prototype.setIcon(L.icon({
    iconUrl: markerIcon,
    iconSize: [24, 36],
    iconAnchor: [12, 36]
}))


// Ajuste la fenêtre de la carte pour avoir toutes les étapes à l’écran
export function ajusteFenêtre(étapes: Étape[], carte: L.Map) {
    console.log("ajusteFenêtre lancé");
    const étapes_filtrées = étapes
        .flatMap(étape => étape instanceof Lieu ? [étape.coords] : []);

    if (étapes_filtrées.length === 1) {
        carte.setView(étapes_filtrées[0], 14);
    } else if (étapes_filtrées.length > 1) {
        carte.fitBounds(L.latLngBounds(étapes_filtrées));
    }
}



export function géomOsmVersLeaflet(g: GéométrieOsm): L.LatLng[] {
    return g.map(x => new L.LatLng(x[1], x[0]));
}


function sommetMédian(g: GéométrieOsm): L.LatLng {
    const sommet_médian = g[g.length >> 2];
    return new L.LatLng(sommet_médian[1], sommet_médian[0]);
}



export class Vecteur {

    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    produitScalaire(autre_vecteur: Vecteur) {
        return this.x * autre_vecteur.x + this.y * autre_vecteur.y;
    }
}


// Représente une étape dans une recherche d’iti
export abstract class Étape {
    nom: string

    abstract pourDjango(): PourDjango;

    supprimeLeafletLayer() {
        null;
    }

    constructor(nom: string) {
        this.nom = nom;
    }
}



export type ArgsLieu = {
    géom: GéométrieOsm,
    nom: string,
}


// Une étape munie d’une géométrie
export default class Lieu extends Étape {


    static R_terre = 6360000; // en mètres
    static coeff_rad = Math.PI / 180; // Multiplier par ceci pour passer en radians

    coords: L.LatLng;
    leaflet_layer: L.Layer; // L’objet leaflet à dessiner sur la carte. (Sera un polyline pour les rues, un marqueur sinon.)
    icone: L.AwesomeMarkers.Icon = iconeFa();
    carte: L.Map;
    étapes?: Étapes;


    // Crée l’objet mais aussi un marqueur. Le marqueur n’est pas lié à la carte.
    constructor(géom: GéométrieOsm, nom: string, carte: L.Map, étapes?: Étapes) {
        super(nom);
        this.coords = sommetMédian(géom);
        this.leaflet_layer = new L.Marker(this.coords, { icon: this.icone });
        this.leaflet_layer.bindPopup(nom);
        this.carte = carte;
        if (étapes) this.étapes = étapes;
    }

    
    pourDjango(): PourDjango {
        return {
            type_étape: "arête",
            lon: this.coords.lng,
            lat: this.coords.lat,
        };
    }

    
    // Màj la propriété coords de l’étape, màj la position du marqueur si marqueur il y a, et màj la fenêtre de la carte si les étapes sont fournies.
    setLatlng(ll: L.LatLng) {
        this.coords = ll;
        (this.leaflet_layer instanceof L.Marker) && this.leaflet_layer.setLatLng(ll);
        this.étapes && ajusteFenêtre(this.étapes?.toutes_les_étapes(), this.carte);
    }


    supprimeLeafletLayer() {
        this.leaflet_layer.remove();
    }


    vecteurVers(autreLieu: Lieu) {
        return this.vecteurVersLatLng(autreLieu.coords);
    }


    vecteurVersLatLng(ll2: L.LatLng): Vecteur {
        const ll1 = this.coords;
        const dx = Lieu.R_terre * Math.cos(ll1.lat * Math.PI / 180) * (ll2.lng - ll1.lng) * Math.PI / 180;
        const dy = Lieu.R_terre * (ll2.lat - ll1.lat) * Math.PI / 180;
        return new Vecteur(dx, dy);
    }

}
