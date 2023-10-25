import L from "leaflet";
import { Lieu, géomOsmVersLeaflet } from "./lieux.ts";
import { GéométrieOsm } from "./types.ts";




////////////////////////////////////////
// Un lieu correspondant à une adresse//
////////////////////////////////////////


// Pour créer un lieu représentant une adresse
export type ArgsLieuAdresse = {
    géom: GéométrieOsm;
    nom: string;
    pk: number;
    avec_num: boolean;
}


export default class LieuAdresse extends Lieu {

    avec_num: boolean = false;
    pk_rue: number; // id dans la base côté server (pas osm)
    géométrie?: L.LatLng[]; // Sera rempli pour une rue sans numéro


    constructor(
        { nom, pk, géom, avec_num }: ArgsLieuAdresse
    ) {

        super(géom, nom);
        this.pk_rue = pk;

        if (avec_num) {
            this.avec_num = true;

            // On va chercher les coords exactes puis on repositionne le marqueur (créé par super)
            this.récupère_coords()
                .then(
                    (ll) => {
                        this.coords = ll;
                        (this.leaflet_layer as L.Marker).setLatLng(ll);
                    }
                );

        } else {
            if (géom) {
                // On associe une ligne à la place du marqueur initialement créé par super
                this.géométrie = géomOsmVersLeaflet(géom);
                this.leaflet_layer.remove();
                this.leaflet_layer = new L.Polyline(this.géométrie, { color: "purple" });
            } else {
                throw new Error("Ni numéro de rue ni géométrie!");
            }
        }
    }


    pourDjango() {
        return {
            "type_étape": "rue",
            "pk": this.pk_rue,
            "coords": this.avec_num ? this.coords : null,
            "num": this.avec_num,
        };
    }


    // Va chercher les coords exactes sur data.gouv.fr
    // Renvoie l’ojbet Latlng correspondant
    async récupère_coords(): Promise<L.LatLng> {
        const url = new URL("https://api-adresse.data.gouv.fr/search/");
        url.searchParams.append("q", this.nom);
        const res_data_gouv = await fetch(url)
            .then(res => res.json());
        const res = res_data_gouv.features[0].geometry.coordinates;
        console.log(`Résultat de l’appel à data.gouv pour ${this.nom}`, res);
        return new L.LatLng(res[1], res[0]);
    }
}
