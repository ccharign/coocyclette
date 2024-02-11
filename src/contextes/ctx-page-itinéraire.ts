import { ReactNode, createContext } from "react";
import { Itinéraire } from "../classes/Itinéraire";
import { LieuJson, tZoneAffichage } from "../classes/types";
import { Étapes } from "../hooks/useÉtapes";
import { GèreUneÉtape } from "../hooks/useÉtape";


// Contexte pour la page principale de l’appli


export type tContexteItinéraire = {
    carte: L.Map | null,
    itinéraires: Itinéraire[],
    zone: string,
    étapes: Étapes,
    setTiroir: (_clef: tZoneAffichage, _ouvert: boolean) => void,
    setStats: React.Dispatch<React.SetStateAction<ReactNode>>,
}

// Création d’un objet Étapes factice pour initialiser le contexte
const fonctionNull = ((_e: LieuJson | null | ((_prev: LieuJson | null) => LieuJson | null)) => null);
const fonctionNull2 = ((_e: any | ((_prev: any) => any)) => null);

const gère_une_étape = new GèreUneÉtape(null, fonctionNull, null, [], fonctionNull2, null);

export const contexte_iti = createContext<tContexteItinéraire>({
    carte: null,
    itinéraires: [],
    zone: "",
    étapes: new Étapes(gère_une_étape, gère_une_étape, [], fonctionNull2, gère_une_étape, null, [], fonctionNull2, null, false, fonctionNull2),
    setTiroir: (_clef, _ouvert) => null,
    setStats: () => null,
})
