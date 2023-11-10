import { createContext } from "react";
import { Itinéraire } from "../../classes/Itinéraire";
import { Étape } from "../../classes/lieux";
import { tClefTiroir } from "../../classes/types";

// Contexte pour la page principale de l’appli
// la carte
// les itis
// les étapes

export type tContexteItinéraire = {
    carte: L.Map | null,
    itinéraires: Itinéraire[],
    zone: string,
    toutes_les_étapes: Étape[],
    setTiroir: (clef: tClefTiroir, ouvert: boolean)=> void,
}

export const contexte_iti = createContext<tContexteItinéraire>({
    carte: null,
    itinéraires: [],
    zone: "",
    toutes_les_étapes:[],
    setTiroir: (_clef, _ouvert)=>null,
})
