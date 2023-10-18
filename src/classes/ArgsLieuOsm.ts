import { Dico } from "./types.ts";
import { TypeLieu } from "./types-lieux.ts";
import { GéométrieOsm } from "./lieux.ts";

export type ArgsLieuOsm = {
    géom: GéométrieOsm; nom: string; type_lieu: TypeLieu; id: number; infos: Dico;
};
