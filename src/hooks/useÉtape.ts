import { useMemo, useState } from "react"
import { Étape } from "../classes/Lieu"
import { LieuJson } from "../classes/types"
import lieuOfJson from "../fonctions/crée-lieu"




// Pour gérer une étape, et les données pour sa boîte de recherche autocomplète
export class GèreUneÉtape {

    étape: Étape | null
    étape_json: LieuJson | null
    private setÉtapeJson: React.Dispatch<React.SetStateAction<LieuJson | null>>
    options_autocomplète: LieuJson[]
    setOptionsAutocomplète: React.Dispatch<React.SetStateAction<LieuJson[]>>


    constructor(
        étape_json: LieuJson | null, setÉtapeJson: React.Dispatch<React.SetStateAction<LieuJson | null>>,
        étape: Étape | null,
        options_autocomplète: LieuJson[], setOptionsAutocomplète: React.Dispatch<React.SetStateAction<LieuJson[]>>
    ) {
        this.étape_json = étape_json;
        this.setÉtapeJson = setÉtapeJson;
        this.étape=étape;
        this.options_autocomplète = options_autocomplète;
        this.setOptionsAutocomplète = setOptionsAutocomplète;
    }


    // Enregistre le json et crée l’objet étape
    setÉtape(étape_json: LieuJson | null) {
        this.setÉtapeJson(étape_json);
        this.setOptionsAutocomplète([étape_json].filter(é => é) as LieuJson[])
        this.étape = étape_json ? lieuOfJson(étape_json) : null;
        return this.étape;
    }


    toString() {
        return this.étape_json
            ? this.étape_json.nom
            : "";
    }
}


export default function useÉtape() {

    const [étape_j, setÉtapeJ] = useState<LieuJson | null>(null);
    const [options_étape, setOptionsÉtape] = useState<LieuJson[]>([]);

    const étape = useMemo(
        () => étape_j ? lieuOfJson(étape_j) : null
        , [étape_j]);

    return new GèreUneÉtape(
        étape_j, setÉtapeJ, étape, options_étape, setOptionsÉtape
    );


}
