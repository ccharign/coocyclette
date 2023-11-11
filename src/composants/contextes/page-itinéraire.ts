import { createContext } from "react";
import { Itinéraire } from "../../classes/Itinéraire";
import { tClefTiroir } from "../../classes/types";
import { tÉtapes } from "../../hooks/useÉtapes";


// Contexte pour la page principale de l’appli


export type tContexteItinéraire = {
    carte: L.Map | null,
    itinéraires: Itinéraire[],
    zone: string,
    étapes: tÉtapes,
    setTiroir: (clef: tClefTiroir, ouvert: boolean) => void,
}


export const contexte_iti = createContext<tContexteItinéraire>({
    carte: null,
    itinéraires: [],
    zone: "",
    étapes: { départ: null, arrivée: null, étape_pas_clic: null, toutes_les_étapes: [] },
    setTiroir: (_clef, _ouvert) => null,
})
