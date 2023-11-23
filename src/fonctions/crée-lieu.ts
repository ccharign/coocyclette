import { Étape } from "../classes/Lieu";
import { LieuJson, GéométrieOsm } from "../classes/types";
import LieuAdresse, { ArgsLieuAdresse } from "../classes/LieuAdresse";
import LieuOsm, { ArgsLieuOsm } from "../classes/LieuOsm";
import { ÉtapeGtl, ArgsÉtapeGtl } from "../classes/types-lieux";

// Sert de transition pour les types suivants
interface LieuSansType {
    géom: GéométrieOsm;
    nom: string;
    pk: number;
}



export default function lieuOfJson(données: LieuJson): Étape {
    switch (données.type_étape) {
        case "adresse": {
            return new LieuAdresse(données as LieuSansType as ArgsLieuAdresse);
        }
        case "lieu": {
            return new LieuOsm(données as LieuSansType as ArgsLieuOsm);
        }
        case "gtl": {
            return new ÉtapeGtl(données as ArgsÉtapeGtl );
        }
        default: {
            throw new Error(`Type non reconnu : ${données.type_étape} pour ${données.nom}`);
        }
    }
}
