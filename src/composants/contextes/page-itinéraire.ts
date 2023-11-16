import { createContext, useState } from "react";
import { Itinéraire } from "../../classes/Itinéraire";
import { tZoneAffichage } from "../../classes/types";
import { Étapes } from "../../hooks/useÉtapes";
import { Étape } from "../../classes/lieux";
import { ÉtapeClic } from "../../classes/ÉtapeClic";


// Contexte pour la page principale de l’appli


export type tContexteItinéraire = {
    carte: L.Map | null,
    itinéraires: Itinéraire[],
    zone: string,
    étapes: Étapes,
    setTiroir: (clef: tZoneAffichage, ouvert: boolean) => void,
}

const [étape, setÉtape] = useState<Étape|null>(null);
const [étapec, setÉtapec] = useState<ÉtapeClic[]>([]);

export const contexte_iti = createContext<tContexteItinéraire>({
    carte: null,
    itinéraires: [],
    zone: "",
    étapes: new Étapes(étape, setÉtape, étape, setÉtape, étapec, setÉtapec, étape, setÉtape, null, []),
    setTiroir: (_clef, _ouvert) => null,
})
