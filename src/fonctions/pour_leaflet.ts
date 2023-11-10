import L from "leaflet"
import "leaflet.fullscreen"
import "leaflet.fullscreen/icon-fullscreen.svg"
import "leaflet.locatecontrol"
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css"
import { Dico, GetItinéraire } from "../classes/types.ts";
import { Itinéraire } from "../classes/Itinéraire.ts"
import { Lieu, Étape } from "../classes/lieux.ts"
import { ÉtapeClic } from "../classes/ÉtapeClic.ts"


// Efface les anciens itinéraires et affiche les nouveaux
// itis: résultat du get
// itinéraires: les itinéraires de l’appli
export function màjItinéraires(itis: GetItinéraire[], carte: L.Map, itinéraires: Itinéraire[]) {

    itinéraires.forEach(
        iti => iti.supprimeLayers()
    );
    itinéraires.length = 0;
    itis.forEach(
        iti => itinéraires.push(new Itinéraire(iti, carte))
    )
}


// Supprime les itinéraires et les étapes passées en arg
export function videItinéraires(itinéraires: Itinéraire[], étapes: Lieu[], setÉtapes : React.Dispatch<React.SetStateAction<ÉtapeClic[]>>) {
    itinéraires.forEach(
        iti => iti.supprimeLayers()
    );
    itinéraires.length = 0;
    itinéraires.forEach(
        iti => iti.supprimeLayers()
    );
    itinéraires.length = 0;
    étapes.forEach(
        l => l.leaflet_layer.remove()
    );
    étapes.length = 0;
    setÉtapes([]);
}



// Ajuste la fenêtre de la carte pour avoir toutes les étapes à l’écran
export function ajusteFenêtre(étapes: Étape[], carte: L.Map) {
    console.log("ajusteFenêtre lancé");
    const étapes_filtrées = étapes
        .flatMap(étape => étape instanceof Lieu ? [étape.coords] : []);

    if (étapes_filtrées.length === 1) {
        carte.setView(étapes_filtrées[0]);
    } else if (étapes_filtrées.length > 1) {
        carte.fitBounds(L.latLngBounds(étapes_filtrées));
    }
}



// https://stackoverflow.com/questions/23567203/leaflet-changing-marker-color
function markerHtmlStyles(coul: string): string {
    return `
  background-color: ${coul};
  width: 2rem;
  height: 2rem;
  display: block;
  left: -1rem;
  top: -1rem;
  position: relative;
  border-radius: 2rem 2rem 0;t
  transform: rotate(45deg);
  border: 1px solid gray`;
}


export function mon_icone(coul: string): L.DivIcon {
    return L.divIcon({
        className: "my-custom-pin",
        iconAnchor: [0, 24],
        // labelAnchor: [-6, 0],
        popupAnchor: [0, -36],
        html: `<span style="${markerHtmlStyles(coul)}" />`
    });
}



// Mettre en entrée la liste des champs du dico à afficher ?
/**
 * Rajoute à la carte « carte » un marqueur avec un popup contenant les infos.
 * @param {dico} infos
 * @param {L.map} carte
 */
export function marqueur_avec_popup(infos: Dico, carte: L.Map) {

    const marqueur = L.marker(
        [infos.lat as number, infos.lon as number]
    ).addTo(carte);

    let contenu = ["nom", "adresse", "horaires", "tél"]
        .filter(c => infos[c])
        .map(c => infos[c])
        .join("<br>");

    //D’après le tuto de leaflet:
    marqueur.bindPopup(`<div class="pop">${contenu}</div>`);

}



export default function carteIci() {
    // Crée une carte à la position actuelle
    // Tuiles de cyclosm
    // Sortie : l’objet map créé

    const laCarte = L.map(
        'laCarte'
        , {
            fullscreenControl: true,
            fullscreenControlOptions: {
                title: "Plein écran",
            }
        }
    )
        .fitWorld();

    coucheCyclosm(laCarte);

    ajoute_fonctionalités_à_la_carte(laCarte);

    laCarte.locate({ setView: true, maxZoom: 14 });

    return laCarte;
}






// Ajoute la couche de tuiles cyclosm à la carte
function coucheCyclosm(carte: L.Map) {
    L.tileLayer(
        'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
        {
            maxZoom: 20,
            attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: {attribution.OpenStreetMap}'
        }
    ).addTo(carte);
}



// Ajoute la couche osm classique puis la surcouche cyclosmlite
function coucheSimple(carte: L.Map) {

    // tuiles osm de base
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(carte);

    // couche cyclosm-lite
    L.tileLayer(
        'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm-lite/{z}/{x}/{y}.png',
        {
            maxZoom: 19,
            attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: {attribution.OpenStreetMap}',
            opacity: .3,
        }
    ).addTo(carte);
}



// Crée une carte sur la bb passée en arg
// Si cyclosm, tuiles cyclosm, sinon tuile osm normales avec une couche cyclosm_lite
// Sortie : la carte créé
export function carteBb(bb: number[], cyclosm = false) {

    const s = bb[0],
        o = bb[1],
        n = bb[2],
        e = bb[3];

    const laCarte = L.map('laCarte',
        //           {"fullscreenControl": true}
    )
        .fitBounds([[s, o], [n, e]]);

    if (cyclosm) {
        coucheCyclosm(laCarte);
    } else {
        coucheSimple(laCarte);
    }

    ajoute_fonctionalités_à_la_carte(laCarte);

    return laCarte;
}


function ajoute_fonctionalités_à_la_carte(carte: L.Map) {
    // Ajoute le bouton géoloc et l’échelle à la carte passée en arg.

    //Bouton de géoloc
    L.control.locate(
        {
            locateOptions: {
                enableHighAccuracy: true,
                setView: false,
            },
            strings: {
                title: "Afficher ma position"
            },
            showCompass: true,
        }
    ).addTo(carte);

    // Échelle
    L.control.scale({ "imperial": false })
        .addTo(carte);

    // Boussole
    // carte.addControl( new L.Control.Compass() );
}
