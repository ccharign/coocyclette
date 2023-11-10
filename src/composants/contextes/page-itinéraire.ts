import { createContext } from "react";
import { Itinéraire } from "../../classes/Itinéraire";
import { Étape } from "../../classes/lieux";

// Contexte pour la page principale de l’appli
// la carte
// les itis
// les étapes

export type tContexteItinéraire = {
    carte: L.Map | null,
    itinéraires: Itinéraire[],
    zone: string,
    toutes_les_étapes: Étape[],
}

export const contexte_iti = createContext<tContexteItinéraire>({
    carte: null,
    itinéraires: [],
    zone: "",
    toutes_les_étapes:[],
})
