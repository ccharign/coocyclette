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
    private setDépart: React.Dispatch<React.SetStateAction<Étape | null>>
    arrivée: Étape | null
    private setArrivée: React.Dispatch<React.SetStateAction<Étape | null>>
    étapes_clic: ÉtapeClic[]
    private setÉtapesClic: React.Dispatch<React.SetStateAction<ÉtapeClic[]>>
    étape_pas_clic: Étape | null
    private setÉtapePasClic: React.Dispatch<React.SetStateAction<Étape | null>>
    carte: L.Map | null
    itinéraires: Itinéraire[]

    constructor(
        départ: Étape | null, setDépart: React.Dispatch<React.SetStateAction<Étape | null>>,
        arrivée: Étape | null, setArrivée: React.Dispatch<React.SetStateAction<Étape | null>>,
        étapes_clic: ÉtapeClic[], setÉtapesClic: React.Dispatch<React.SetStateAction<ÉtapeClic[]>>,
        étape_pas_clic: Étape | null, setÉtapePasClic: React.Dispatch<React.SetStateAction<Étape | null>>,
        carte: L.Map | null, itinéraires: Itinéraire[]
    ) {
        this.arrivée = arrivée;
        this.setArrivée = setArrivée;
        this.départ = départ;
        this.setDépart = setDépart;
        this.étape_pas_clic = étape_pas_clic;
        this.setÉtapePasClic = setÉtapePasClic;
        this.étapes_clic = étapes_clic;
        this.setÉtapesClic = setÉtapesClic;
        this.carte = carte;
        this.itinéraires = itinéraires;
    }


    // Renvoie la liste de toutes les étapes
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


    fonctionSetÉtape(setÉtape: React.Dispatch<React.SetStateAction<Étape | null>>, value: LieuJson | null) {

        videItinéraires(this.itinéraires, this.étapes_clic);

        // Récupérer l’objet Étape
        const étape = (value) ? lieuOfJson(value) : null;

        // Afficher le layer leaflet
        if (this.carte && étape instanceof Lieu) {
            étape.leaflet_layer.addTo(this.carte);
        }

        // màj les données
        setÉtape(prev => {
            prev && prev.supprimeLeafletLayer();
            étape && ajusteFenêtre(this.toutes_les_étapes().concat([étape]), this.carte as L.Map);
            console.log("Étape màj : ", étape);
            return étape;
        });
    }



    insèreÉtapeClic(i: number, étape: ÉtapeClic) {
        this.setÉtapesClic(
            prev => {
                prev.splice(i, 0, étape);
                this.màjNuméros();
                return [...prev];
            }
        )
    }

    // Supprime l’étape d’indice i *dans toutes_les_étapes*
    supprimeÉtapeClic(i: number) {
        this.setÉtapesClic(prev => {
            prev.splice(i - 1, 1);
            this.màjNuméros();
            return [...prev];
        }
        )
    }

    changeDépart(départ: LieuJson) {
        this.fonctionSetÉtape(this.setDépart, départ);
    }


    changeArrivée(arrivée: LieuJson) {
        this.fonctionSetÉtape(this.setArrivée, arrivée);
    }

    changeÉtapePasClic(étape: LieuJson){
        this.fonctionSetÉtape(this.setÉtapePasClic, étape);
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
        départ, setDépart,
        arrivée, setArrivée,
        étapes_clic, setÉtapesClic,
        étape_pas_clic, setÉtapePasClic,
        carte, itinéraires,
    );



    function étapesReducer(action: ActionÉtape) {
        switch (action.cat) {
            case "set-départ": {
                étapes.fonctionSetÉtape(setDépart, action.val as LieuJson | null);
                break;
            }
            case "set-arrivée": {
                étapes.fonctionSetÉtape(setArrivée, action.val as LieuJson | null);
                break;
            }
            case "set-étape-pas-clic": {
                étapes.fonctionSetÉtape(setÉtapePasClic, action.val as LieuJson | null);
                break;
            }
            case "insère": {
                étapes.insèreÉtapeClic(action.position as number, action.val as ÉtapeClic)
                break;
            }
            case "supprime": {
                étapes.supprimeÉtapeClic(action.position as number);
            }
        }

    }

    return { étapes, étapesReducer };
}
