import L from "leaflet";
import { sansIcone } from "./iconeFa.ts";
import { Lieu, PourDjango } from "./lieux.ts";
import { ActionÉtape } from "../hooks/useÉtapes.ts";




/////////////////////////////////////
//// Étapes créées par des clics ////
/////////////////////////////////////

// Étape obtenue par un clic sur la carte
// Avec une étiquette pour le numéro de l’étape.
// Déplaçable




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
    let res = toutes_les_étapes.length - 1; // On n’insère jamais après l’arrivée.
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


// Sera mis dans les popup
const bouton_suppr = '<button type="button" class="supprimeÉtape">Supprimer</button>';



export class ÉtapeClic extends Lieu {

    numéro: number;
    //setÉtapes: React.Dispatch<React.SetStateAction<ÉtapeClic[]>>; // setter React pour les étapes intermédiaires
    étapesReducer: (action: ActionÉtape) => void;
    carte: L.Map;
    //layer_group: L.LayerGroup;
    //setDonnéesModifiées: React.Dispatch<React.SetStateAction<boolean>>; // pour indiquer qu’il y a eu des changements dans les données du form

    constructor(
        ll: L.LatLng,
        toutes_les_étapes: Lieu[],
        //setÉtapes: React.Dispatch<React.SetStateAction<ÉtapeClic[]>>,
        étapesReducer: (action: ActionÉtape) => void,
        //layer_group: L.LayerGroup, // le layerGroup auquel appartiendra le marqueur de cette étape
        carte: L.Map,
        setDonnéesModifiées: React.Dispatch<React.SetStateAction<boolean>>
    ) {

        super([[ll.lng, ll.lat]], "Point de passage");
        //this.setÉtapes = setÉtapes;
        this.étapesReducer = étapesReducer;
        //this.layer_group = layer_group;
        this.carte = carte;
        //this.setDonnéesModifiées = setDonnéesModifiées;

        // On écrase le marqueur créé par super
        this.leaflet_layer = new L.Marker(
            ll,
            {
                draggable: true,
                icon: sansIcone("green")
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
                "",
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
                    bouton.addEventListener(
                        "click",
                        () => {
                            setDonnéesModifiées(true);
                            this.supprimer();

                        }
                    );
                }
            )
        .addTo(carte);
        

        // Insérer l’étape dans la liste de toutes les étapes
        this.numéro = numOùInsérer(ll, toutes_les_étapes);
        this.étapesReducer(
            { cat: "insère", position: this.numéro - 1, val: this }
        );
    }


    // Change le numéro et màj l’étiquette
    setNuméro(i: number) {
        this.numéro = i;
        (this.leaflet_layer.getTooltip() as L.Tooltip).setContent(`${i}`);
    }


    // Supprime l’étape
    supprimer() {
        //this.layer_group.removeLayer(this.leaflet_layer);
        this.leaflet_layer.remove();
        this.étapesReducer(
            {
                cat: "supprime",
                position: this.numéro,
            }
        );

    }


    // Renvoie l’objet à envoyer au serveur pour calcul d’itinéraire
    pourDjango(): PourDjango {
        return {
            type_étape: "arête",
            lon: this.coords.lng,
            lat: this.coords.lat,
        };
    }
}
