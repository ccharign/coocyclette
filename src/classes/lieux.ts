
import L from "leaflet"
import { Dico, OverpassRes, GéométrieOsm, LieuJson } from "./types.ts";
import { TypeLieu } from "./types-lieux.ts";
import markerIcon from "../../node_modules/leaflet/dist/images/marker-icon.png";


// https://stackoverflow.com/questions/23567203/leaflet-changing-marker-color
function markerHtmlStyles(coul: string) {
    return `
  background-color: ${coul};
  width: 2rem;
  height: 2rem;
  display: block;
  left: -1rem;
  top: -1rem;
  position: relative;
  border-radius: 2rem 2rem 0;
  transform: rotate(45deg);
  border: 1px solid gray`;
}

function mon_icone(coul: string) {
    return L.divIcon({
        className: "my-custom-pin",
        iconAnchor: [0, 24],
        //labelAnchor: [-6, 0],
        popupAnchor: [0, -36],
        html: `<span style="${markerHtmlStyles(coul)}" />`
    });
}


// Sert de transition pour les types suivants
interface LieuSansType {
    géom: GéométrieOsm;
    nom: string;
    pk: number;
}

// Pour créer un lieu représentant une adresse
type ArgsLieuAdresse = {
    géom: GéométrieOsm;
    nom: string;
    pk: number;
    avec_num: boolean;
}

// type utilisé pour créer un lieu osm depuis les données du serveur d’osm-velo
type ArgsLieuOsm = {
    géom: GéométrieOsm,
    nom: string,
    type_lieu: string,  // en français
    pk: number,
    infos: Dico,
}

// type général pour créer un lieu osm
type ArgsLieuOsmGénéral = {
    géom: GéométrieOsm,
    nom: string,
    type_lieu: string,
    pk?: number,
    id_osm?: number,
    infos: Dico,
}


// Pour envoyer au serveur
type PourDjango = {
    type_étape: string,
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


export abstract class Lieu {

    static R_terre = 6360000; // en mètres
    static coeff_rad = Math.PI / 180; // Multiplier par ceci pour passer en radians

    coords: L.LatLng;
    leaflet_layer: L.Layer; // L’objet leaflet à dessiner sur la carte. (Sera un polyline pour les rues, un marqueur sinon.)
    nom: string;


    abstract pourDjango(): PourDjango;

    // Crée l’objet mais aussi un marqueur. Le marqueur n’est pas lié à la carte.
    constructor(géom: GéométrieOsm, nom: string) {
        this.coords = sommetMédian(géom);
        this.leaflet_layer = new L.Marker(this.coords);
        this.leaflet_layer.bindPopup(nom);
        this.nom = nom
    }


    setLatlng(ll: L.LatLng) {
        this.coords = ll;
    }


    vecteurVers(autreLieu: Lieu) {
        return this.vecteurVersLatLng(autreLieu.coords);
    }

    vecteurVersLatLng(ll2: L.LatLng): Vecteur {
        const ll1 = this.coords;
        const dx = LieuOsm.R_terre * Math.cos(ll1.lat * Math.PI / 180) * (ll2.lng - ll1.lng) * Math.PI / 180;
        const dy = LieuOsm.R_terre * (ll2.lat - ll1.lat) * Math.PI / 180;
        return new Vecteur(dx, dy);
    }


    static from_json(données: LieuJson): Lieu {
        switch (données.type_étape) {
            case "adresse": {
                return new LieuAdresse(données as LieuSansType as ArgsLieuAdresse);
            }
            case "lieu": {
                return new LieuOsm(données as LieuSansType as ArgsLieuOsm);
            }
            default: {
                throw new Error(`Type non reconnu : ${données.type_étape} pour ${données.nom}`);
            }
        }
    }

}





////////////////////////////////////////
// Un lieu correspondant à une adresse//
////////////////////////////////////////



export class LieuAdresse extends Lieu {

    avec_num: boolean = false;
    pk_rue: number; // id dans la base côté server (pas osm)
    géométrie?: L.LatLng[];  // Sera rempli pour une rue sans numéro


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
                )

        } else {
            if (géom) {
                // On associe une ligne à la place du marqueur initialement créé par super
                this.géométrie = géomOsmVersLeaflet(géom);
                this.leaflet_layer.remove();
                this.leaflet_layer = new L.Polyline(this.géométrie);
            } else {
                throw new Error("Ni numéro de rue ni géométrie!")
            }
        }
    }

    pourDjango() {
        return {
            "type_étape": "rue",
            "pk": this.pk_rue,
            "coords": this.avec_num ? this.coords : null,
            "num": this.avec_num,
        }
    }


    // Va chercher les coords exactes sur data.gouv.fr
    // Renvoie l’ojbet Latlng correspondant
    async récupère_coords(): Promise<L.LatLng> {
        const url = new URL("https://api-adresse.data.gouv.fr/search/");
        url.searchParams.append("q", this.nom);
        const res_data_gouv = await fetch(url).then(res => res.json());
        const res = res_data_gouv.features[0].geometry.coordinates;
        console.log(`Résultat de l’appel à data.gouv pour ${this.nom}`, res);
        return new L.LatLng(res[1], res[0]);
    }
}






///////////////////////////////////////
//// Un lieu venant d’un objet osm ////
///////////////////////////////////////



// Le marqueur a une popup avec les infos dispo
export class LieuOsm extends Lieu {


    infos: Dico;
    type_lieu: string;  // Nom en français du type de lieu (ex: boulangerie)
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
            throw new Error(`Pk pas disponible pour ${this.nom}`)
        }
        return {
            "type_étape": "lieu",
            "pk": this.pk,
        }
    }

    // Crée un LieuOsm à partir du résultat d’une requête overpass
    static from_overpass(données: OverpassRes, tousLesTls: TypeLieu[]) {

        // Récupérer le tl
        const tl = tousLesTls.filter(
            tl => tl.catégorie_osm in données.tags
        ).filter(
            tl => données.tags[tl.catégorie_osm] === tl.nom_osm
        ).pop() as TypeLieu;

        const géom = [[données.lon, données.lat]] as GéométrieOsm
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






/////////////////////////////////////
//// Étapes créées par des clics ////
/////////////////////////////////////



// latlng: coords du point cliqué
// toutes_les_étapes : toutes les étapes y compris départ et arrivée
// Sortie : indice où mettre la nouvelle étapes dans toutes_les_étapes, ce sera également le numéro de celle-ci.
// En particulier, la sortie est toujours⩾1
function numOùInsérer(latlng: L.LatLng, toutes_les_étapes: Lieu[]): number {
    if (toutes_les_étapes.length === 0) {
        throw new Error("La liste d’étapes était vide");
    } else if (toutes_les_étapes.length === 1) {
        // Une seul étape: on considère que c’est le départ
        return 1;
    }
    let res = toutes_les_étapes.length-1; // On n’insère jamais après l’arrivée.
    let éa = toutes_les_étapes[res];	// étape actuelle
    let ép = toutes_les_étapes[res - 1]; // étape préc
    let vi = ép.vecteurVers(éa); // vecteur suivant l’itinéraire actuel
    let vé = ép.vecteurVersLatLng(latlng); // vecteur vers l’étape à rajouter

    while (res > 1 && vi.produitScalaire(vé) < 0) { // On n’insère jamais avant le départ càd en 0
        res--;
        éa = ép;
        ép = toutes_les_étapes[res - 1];
        vi = ép.vecteurVers(éa);
        vé = ép.vecteurVersLatLng(latlng);
    }

    return res;
}


// étapes: les étapes intermédiaire, hors départ et arrivée
// Effet: màj le numéro de toutes les étapes
function màjNumérosÉtapes(étapes: ÉtapeClic[]) {
    let i = 0;
    étapes.forEach(
        é => {
            i++;
            é.setNuméro(i);
        }
    )
}


function insèreÉtape(i: number, étape: ÉtapeClic, setÉtapes: React.Dispatch<React.SetStateAction<ÉtapeClic[]>>) {
    setÉtapes(
        prev => {
            prev.splice(i, 0, étape);
            màjNumérosÉtapes(prev);
            return prev;
        }
    )
}

// Sera mis dans les popup
const bouton_suppr = '<button type="button" class="supprimeÉtape">Supprimer</button>';



// Étape obtenue par un clic sur la carte
// Avec une étiquette pour le numéro de l’étape.
// Déplaçable
export class ÉtapeClic extends Lieu {

    numéro: number;
    setÉtapes: React.Dispatch<React.SetStateAction<ÉtapeClic[]>>  // setter React pour les étaper intermédiaires
    layer_group: L.LayerGroup;

    constructor(
        ll: L.LatLng,
        toutes_les_étapes: Lieu[],
        setÉtapes: React.Dispatch<React.SetStateAction<ÉtapeClic[]>>,
        layer_group: L.LayerGroup  // le layerGroup auquel appartiendra le marqueur de cette étape
    ) {

        super([[ll.lng, ll.lat]], "Point de passage");
        this.setÉtapes = setÉtapes;
        this.layer_group = layer_group;

        // On écrase le marqueur créé par super
        this.leaflet_layer = new L.Marker(
            ll,
            {
                draggable: true,
                icon: mon_icone("green")
            }
        )
            // màj les coords si déplacé
            .on("dragend",
                e => {
                    this.setLatlng(e.target.getLatLng());
                }
            )
            // Création de l’étiquette
            .bindTooltip(
                "",  // sera rempli par le numéro lors de l’insertion
                { permanent: true, direction: "bottom" }
            )
            // Bouton pour supprimer l’étape
            .bindPopup(bouton_suppr)
            .on("popupopen",
                () => {
                    const bouton = document.querySelector(".supprimeÉtape");
                    if (!bouton) {
                        throw new Error("Bouton supprimer pas trouvé");
                    }
                    bouton.addEventListener("click",
                        ()=>this.supprimer()
                    );
                }
            );

        // Gestion du numéro
        this.numéro = numOùInsérer(ll, toutes_les_étapes);
        insèreÉtape(this.numéro - 1, this, setÉtapes);

        this.layer_group.addLayer(this.leaflet_layer);
    }


    // Change le numéro et màj l’étiquette
    setNuméro(i: number) {
        this.numéro = i;
        (this.leaflet_layer.getTooltip() as L.Tooltip).setContent(`${i}`);
    }


    // Supprime l’étape
    supprimer() {
        this.layer_group.removeLayer(this.leaflet_layer);
        this.setÉtapes(
            prev => {
                prev.splice(this.numéro - 1, 1);
                màjNumérosÉtapes(prev);
                return prev;
            }
        );

    }



    pourDjango(): PourDjango {
        return {
            type_étape: "arête",
            lon: this.coords.lng,
            lat: this.coords.lat,

        }
    }
}
