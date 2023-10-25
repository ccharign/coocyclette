import { Lieu } from "../classes/lieux";
import { LieuJson, GéométrieOsm } from "../classes/types";
import LieuAdresse, { ArgsLieuAdresse } from "../classes/LieuAdresse";
import LieuOsm, { ArgsLieuOsm } from "../classes/LieuOsm";


// Sert de transition pour les types suivants
interface LieuSansType {
    géom: GéométrieOsm;
    nom: string;
    pk: number;
}


export default function lieuOfJson(données: LieuJson): Lieu {
    switch (données.type_étape) {
        case "adresse": {
            return new LieuAdresse(données as LieuSansType as ArgsLieuAdresse);
        }
        case "lieu": {
            return new LieuOsm(données as LieuSansType as ArgsLieuOsm);
        }
        default: {
            throw new Error(`Type non reconnu : ${données.type_étape} pour ${données.nom}`);
        }
    }
}
