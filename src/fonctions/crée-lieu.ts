import Lieu, { Étape } from "../classes/Lieu";
import { LieuJson, GéométrieOsm } from "../classes/types";
import LieuAdresse, { ArgsLieuAdresse } from "../classes/LieuAdresse";
import LieuOsmAvecÉtapes, { ArgsLieuOsm } from "../classes/LieuOsm";
import { ÉtapeGtl, ArgsÉtapeGtl } from "../classes/types-lieux";
import MaPosition from "../classes/MaPosition";
import type { Étapes } from "../hooks/useÉtapes.ts";

// Sert de transition pour les types suivants
interface LieuSansType {
    géom: GéométrieOsm;
    nom: string;
    pk?: number;
}



export default function lieuOfJson(données: LieuJson, carte: L.Map, étapes?: Étapes): Étape {
    switch (données.type_étape) {
        case "adresse": {
            return new LieuAdresse(données as LieuSansType as ArgsLieuAdresse, carte, étapes);
        }
        case "lieu": {
            return new LieuOsmAvecÉtapes(données as LieuSansType as ArgsLieuOsm, carte, étapes);
        }
        case "gtl": {
            return new ÉtapeGtl(données as ArgsÉtapeGtl);
        }
        case "arête": {
            return new Lieu(données.géom, données.nom, carte, étapes);
        }
        case "ma-position": {
            return new MaPosition(carte, étapes);
        }
        default: {
            throw new Error(`Type non reconnu : ${données.type_étape} pour ${données.nom}`);
        }
    }
}
