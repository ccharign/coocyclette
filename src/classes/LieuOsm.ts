import { Dico, OverpassRes, GéométrieOsm } from "./types.ts";
import { TypeLieu } from "./types-lieux.ts";
import Lieu from "./Lieu.ts";




// Le marqueur a une popup avec les infos dispo



// type utilisé pour créer un lieu osm depuis les données du serveur d’osm-velo
export type ArgsLieuOsm = {
    géom: GéométrieOsm,
    nom: string,
    type_lieu: string,  // en français
    pk: number,
    infos: Dico,
}

// type général pour créer un lieu osm
export type ArgsLieuOsmGénéral = {
    géom: GéométrieOsm,
    nom: string,
    type_lieu: string,
    pk?: number,
    id_osm?: number,
    infos: Dico,
}


export default class LieuOsm extends Lieu {


    infos: Dico;
    type_lieu: string; // Nom en français du type de lieu (ex: boulangerie)
    pk?: number; // id Django
    id_osm?: number; // id osm


    constructor({ géom, nom, type_lieu, infos, pk, id_osm }: ArgsLieuOsmGénéral) {
        super(géom, nom);
        this.type_lieu = type_lieu;
        this.infos = infos;
        if (pk) this.pk = pk;
        if (id_osm) this.id_osm = id_osm;

        const contenu_popup = ["opening_hours", "phone", "adresse"]
            .filter(c => this.infos[c])
            .map(c => this.infos[c])
            .join("<br>");

        // TODO styler la popup
        this.leaflet_layer.setPopupContent(`<div class="pop">${this.nom} (${this.type_lieu})<br>${contenu_popup}</div>`);
    }


    pourDjango() {
        if (!this.pk) {
            throw new Error(`Pk pas disponible pour ${this.nom}`);
        }
        return {
            "type_étape": "lieu",
            "pk": this.pk,
        };
    }

    // Crée un LieuOsm à partir du résultat d’une requête overpass
    static from_overpass(données: OverpassRes, tousLesTls: TypeLieu[]) {

        // Récupérer le tl
        const tl = tousLesTls.filter(
            tl => tl.catégorie_osm in données.tags
        ).filter(
            tl => données.tags[tl.catégorie_osm] === tl.nom_osm
        ).pop() as TypeLieu;

        const géom = [[données.lon, données.lat]] as GéométrieOsm;
        const infos = données.tags;
        const res = new LieuOsm({
            géom: géom,
            nom: infos.name ? infos.name : "",
            type_lieu: tl.nom,
            id_osm: données.id,
            infos: infos
        });
        return res;
    }
}
