
import L from "leaflet"
import { Dico, OverpassRes } from "./types.ts";
import { TypeLieu } from "./types-lieux.ts";


class Vecteur {

    x:number;
    y:number;
    
    constructor(x:number, y:number){
	this.x = x;
	this.y = y;
    }

    produitScalaire(autre_vecteur: Vecteur){
	return this.x*autre_vecteur.x + this.y*autre_vecteur.y;
    }
}


// Lieu de base : des coords et un marqueur
export class Lieu{

    static R_terre = 6360000; // en mètres
    static coeff_rad = Math.PI / 180; // Multiplier par ceci pour passer en radians

    coords: L.LatLng;
    marqueur: L.Marker;

    
    // Crée l’objet mais aussi un marqueur. Le marqueur n’est pas lié à la carte.
    constructor(ll: L.LatLng) {
        this.coords = ll;
        this.marqueur = new L.Marker(ll)
    }


    setLatlng(ll: L.LatLng) {
	this.coords = ll;
    }


    vecteurVers(autreLieu: LieuOsm){
	return this.vecteurVersLatLng(autreLieu.coords);
    }

    vecteurVersLatLng(ll2: L.LatLng){
	const ll1 = this.coords;
	const dx = LieuOsm.R_terre * Math.cos(ll1.lat*Math.PI/180) * (ll2.lng - ll1.lng)*Math.PI/180;
	const dy = LieuOsm.R_terre * (ll2.lat - ll1.lat)*Math.PI/180;
	return new Vecteur(dx, dy);
    }
}




// Un lieu venant d’un objet osm
// Le marqueur a une popup avec les infos dispo
export class LieuOsm extends Lieu {


    infos: Dico = {};
    type_lieu: TypeLieu;
    id: number;  // id osm


    constructor(ll: L.LatLng, type_lieu: TypeLieu, id: number, infos?: Dico,) {
        super(ll);
        this.type_lieu = type_lieu;
	if (infos){
	    this.infos = infos;
	}
	this.id = id;

	const contenu_popup = ["name", "opening_hours", "phone" ]
	    .filter(c=>this.infos[c])
	    .map(c=>this.infos[c])
	    .join("<br>");

	this.marqueur.bindPopup(`<div class="pop">${this.type_lieu.nom}<br>${contenu_popup}</div>`);
    }
    

    static from_overpass(données: OverpassRes, tousLesTls: TypeLieu[]) {

        // Récupérer le tl
        const tl = tousLesTls.filter(tl =>
            tl.catégorie_osm in données.tags
        ).filter(
            tl => données.tags[tl.catégorie_osm] === tl.nom_osm
        ).pop() as TypeLieu;
        
	const ll = new L.LatLng(données.lat, données.lon);
        const res = new LieuOsm(ll, tl, données.id, données.tags);
        return res;	
    }


}

