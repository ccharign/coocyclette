import { createContext } from "react";
import { Itinéraire } from "../../classes/Itinéraire";
import { tClefTiroir } from "../../classes/types";
import { Étapes } from "../../hooks/useÉtapes";


// Contexte pour la page principale de l’appli


export type tContexteItinéraire = {
    carte: L.Map | null,
    itinéraires: Itinéraire[],
    zone: string,
    étapes: Étapes,
    setTiroir: (clef: tClefTiroir, ouvert: boolean) => void,
}


export const contexte_iti = createContext<tContexteItinéraire>({
    carte: null,
    itinéraires: [],
    zone: "",
    étapes: new Étapes(null, null, [], null),
    setTiroir: (_clef, _ouvert) => null,
})
