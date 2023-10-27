//import Papa from "papaparse";

import { PourDjango, Étape } from "./lieux";

export class TypeLieu {

    nom_osm: string
    nom: string
    catégorie_osm: string

    constructor(nom: string, nom_osm: string, catégorie: string) {
        this.nom_osm = nom_osm;
        this.nom = nom;
        this.catégorie_osm = catégorie;
    }

    versOverpass() {
        return `node[${this.catégorie_osm}=${this.nom_osm}]`;
    }

    toString() {
        return this.nom;
    }

}


// Un ensemble de types de lieux
// Utilisé dans le form autourDeMoi
export class GroupeTypeLieu {

    nom: string
    types_lieux: TypeLieu[]

    constructor(nom: string, types_lieux: TypeLieu[]) {
        this.nom = nom;
        this.types_lieux = types_lieux;
    }

    toString() {
        return this.nom;
    }

    unMaisPasTous(tl_sélectionnés: Map<TypeLieu, boolean>) {
        let nb = 0;
        this.types_lieux.forEach(tl => {
            if (tl_sélectionnés.get(tl)) nb++;
        })
        return nb > 0 && nb < this.types_lieux.length;
    }
}



//////////////////////////////////////////////////////
// Groupe de type de lieu identifié par sa pk Django//
// utilisé comme étape pour la recherche d’iti      //
//////////////////////////////////////////////////////

export type ArgsÉtapeGtl = {
    nom: string,
    pk: number,
}

export class ÉtapeGtl extends Étape {

    pk: number

    constructor({ nom, pk }: ArgsÉtapeGtl) {
        super(nom);
        this.pk = pk;
    }

    pourDjango(): PourDjango {
        return {
            type_étape: "gtl",
            pk: this.pk,
        }
    }
}
