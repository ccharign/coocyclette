import { Lieu, Étape } from "../classes/lieux";
import { ÉtapeClic } from "../classes/ÉtapeClic";
import { LieuJson } from "../classes/types";
import lieuOfJson from "../fonctions/crée-lieu";
import { ajusteFenêtre, videItinéraires } from "../fonctions/pour_leaflet";
import { Itinéraire } from "../classes/Itinéraire";
import { useState } from "react";


type CatActionÉtape = "set-départ" | "set-arrivée" | "set-étape-pas-clic" | "insère" | "supprime";

export type ActionÉtape = {
    cat: CatActionÉtape,
    val?: LieuJson | null | Étape,
    position?: number,
};


export class Étapes {
    départ: Étape | null
    arrivée: Étape | null
    étapes_clic: ÉtapeClic[]
    étape_pas_clic: Étape | null


    constructor(départ: Étape | null, arrivée: Étape | null, étapes_clic: ÉtapeClic[], étape_pas_clic: Étape | null) {
        this.arrivée = arrivée;
        this.départ = départ;
        this.étape_pas_clic = étape_pas_clic;
        this.étapes_clic = étapes_clic;
    }

    toutes_les_étapes() {
        return [this.départ, this.étape_pas_clic, ...this.étapes_clic, this.arrivée].filter(é => é) as Étape[];
    }

    // Effet: màj le numéro de toutes les étapes clic
    màjNuméros() {
        let i = 0;
        this.étapes_clic.forEach(
            é => {
                i++;
                é.setNuméro(i);
            }
        )
    }


}




export default function useÉtapes(carte: L.Map | null, itinéraires: Itinéraire[]) {

    const [départ, setDépart] = useState<Étape | null>(null);
    const [arrivée, setArrivée] = useState<Étape | null>(null);
    //const [étapes_clic, setÉtapesClic] = useState<ÉtapeClic[]>([]);
    const [étape_pas_clic, setÉtapePasClic] = useState<Étape | null>(null);

    const [étapes_clic, setÉtapesClic] = useState<ÉtapeClic[]>([]);



    // Sera automatiquement recalculé à chaque rendu : pas besoin de le mettre dans un state
    const étapes = new Étapes(
        départ,
        arrivée,
        étapes_clic,
        étape_pas_clic
    );


    function fonctionSetÉtape(setÉtape: React.Dispatch<React.SetStateAction<Étape | null>>, value: LieuJson | null) {

        videItinéraires(itinéraires, étapes_clic);

        // Récupérer l’objet Étape
        const étape = (value) ? lieuOfJson(value) : null;

        // Afficher le layer leaflet
        if (carte && étape instanceof Lieu) {
            étape.leaflet_layer.addTo(carte);
        }

        // màj les données
        setÉtape(prev => {
            prev && prev.supprimeLeafletLayer();
            étape && ajusteFenêtre(étapes.toutes_les_étapes().concat([étape]), carte as L.Map);
            console.log("Étape màj : ", étape);
            return étape;
        });
    }



    function insèreÉtapeClic(i: number, étape: ÉtapeClic) {
        setÉtapesClic(
            prev => {
                prev.splice(i, 0, étape);
                étapes.màjNuméros();
                return [...prev];
            }
        )

    }

    // Supprime l’étape d’indice i *dans toutes_les_étapes*
    function supprimeÉtapeClic(i: number) {
        setÉtapesClic(prev => {
            prev.splice(i - 1, 1);
            étapes.màjNuméros();
            return [...prev];
        }
        )
    }


    function étapesReducer(action: ActionÉtape) {
        switch (action.cat) {
            case "set-départ": {
                fonctionSetÉtape(setDépart, action.val as LieuJson | null);
                break;
            }
            case "set-arrivée": {
                fonctionSetÉtape(setArrivée, action.val as LieuJson | null);
                break;
            }
            case "set-étape-pas-clic": {
                fonctionSetÉtape(setÉtapePasClic, action.val as LieuJson | null);
                break;
            }
            case "insère": {
                insèreÉtapeClic(action.position as number, action.val as ÉtapeClic)
                break;
            }
            case "supprime": {
                supprimeÉtapeClic(action.position as number);
            }
        }

    }

    return { étapes, étapesReducer };
}
