import { createContext } from "react";
import { Itinéraire } from "../classes/Itinéraire";
import { tZoneAffichage } from "../classes/types";
import { Étapes} from "../hooks/useÉtapes"


// Contexte pour la page principale de l’appli


export type tContexteItinéraire = {
    carte: L.Map | null,
    itinéraires: Itinéraire[],
    zone: string,
    étapes: Étapes,
    setTiroir: (clef: tZoneAffichage, ouvert: boolean) => void,
}


const étape = null;

export const contexte_iti = createContext<tContexteItinéraire>({
    carte: null,
    itinéraires: [],
    zone: "",
    étapes: new Étapes(étape, _e => null, étape, _e => null, [], _e => null, étape, _e => null, null, []),
    setTiroir: (_clef, _ouvert) => null,
})
