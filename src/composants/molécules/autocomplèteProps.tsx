import { LieuJson } from "../../classes/types";
import React from "react";
import { ÉtapeClic } from "../../classes/ÉtapeClic";

export type autocomplèteProps = {
    label: string;
    placeHolder: string;
    étape: GèreUneÉtape;
    //value: LieuJson | null,
    étapes_clic: ÉtapeClic[];
    setÉtapesClic: React.Dispatch<React.SetStateAction<ÉtapeClic[]>>;
    //setÉtape: React.Dispatch<React.SetStateAction<Étape | undefined>>,
    setDonnéesModifiées: React.Dispatch<React.SetStateAction<boolean>>;
    onChange: (val: LieuJson | null) => void;
};
