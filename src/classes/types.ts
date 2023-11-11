

export type Dico = { [clef: string]: string | number };

export type OverpassRes = {
    id: number,
    lat: number,
    lon: number,
    tags: any,
    type: string,
}

// géomtrie osm : coords au format [lon, lat]
export type GéométrieOsm = [number, number][];


// C’est le type reçu du serveur lors d’une autocomplétion
export interface LieuJson {
    type_étape: string;
    géom: GéométrieOsm;  // le plus souvent un singleton. Attention, format issu d’openstreetmap, donc (lon,lat).
    nom: string;
    pk: number; // pk de l’objet dans la base Django
}


// Type reçu du serveur lors d’une recherche d’itinéraire
export type GetItinéraire = {
    points: GéométrieOsm,
    couleur: string,
    lieux: LieuJson[],
    pourcentage_détour: number,
    longueur: number,
    nom: string,
}



// Pour les tiroirs de la page principale

export type VariantDrawer = "persistent" | "permanent" | "temporary" | undefined;

type Ancre = 'top' | 'left' | 'bottom' | 'right';
export type tZoneAffichage = "recherche"  | "contribuer" | "stats";
export type tTiroir = {
    nom: string,
    ancre: Ancre,
    contenu: React.ReactNode,
};
export type tTiroirOuvert = Map<tZoneAffichage, boolean>;
