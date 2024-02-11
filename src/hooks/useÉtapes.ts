import Lieu, { ajusteFenêtre, Étape } from "../classes/Lieu";
import { ÉtapeClic } from "../classes/ÉtapeClic";
import type { GéométrieOsm, LieuJson } from "../classes/types";
import { positionVersGeom, videItinéraires } from "../fonctions/pour_leaflet";
import type { Itinéraire } from "../classes/Itinéraire";
import { ReactNode, useEffect, useState } from "react";
import useÉtape, { GèreUneÉtape } from "./useÉtape";
import { iconeFa } from "../classes/iconeFa";
import L from "leaflet";
import lieuOfJson from "../fonctions/crée-lieu";


////////////////////////////////////////
//
// Utilisations :
// - via toutes_les_étapes : pour envoyer les données
// - départ et arrivée : pour les autocomplètes du formRecherche. Besoin des json initiaux pour les champs value
//
//////////////////////////////////////////////////





export class Étapes {

    départ: GèreUneÉtape
    arrivée: GèreUneÉtape

    étapes_clic: ÉtapeClic[]
    private setÉtapesClic: React.Dispatch<React.SetStateAction<ÉtapeClic[]>>

    étape_pas_clic: GèreUneÉtape

    carte: L.Map | null
    itinéraires: Itinéraire[]
    setStats: React.Dispatch<React.SetStateAction<ReactNode>>
    partir_de_ma_position: boolean
    setPartirDeMaPosition: React.Dispatch<React.SetStateAction<boolean>>
    ma_position: GéométrieOsm | null

    constructor(
        départ: GèreUneÉtape,
        arrivée: GèreUneÉtape,
        étapes_clic: ÉtapeClic[], setÉtapesClic: React.Dispatch<React.SetStateAction<ÉtapeClic[]>>,
        étape_pas_clic: GèreUneÉtape,
        carte: L.Map | null, itinéraires: Itinéraire[],
        setStats: React.Dispatch<React.SetStateAction<ReactNode>>,
        ma_position: GéométrieOsm | null,
        partir_de_ma_position: boolean, setPartirDeMaPosition: React.Dispatch<React.SetStateAction<boolean>>,
    ) {
        this.étapes_clic = étapes_clic;
        this.setÉtapesClic = setÉtapesClic;
        this.carte = carte;
        this.itinéraires = itinéraires;
        this.départ = départ;
        this.arrivée = arrivée;
        this.étape_pas_clic = étape_pas_clic;
        this.setStats = setStats;
        this.ma_position = ma_position;
        this.partir_de_ma_position = partir_de_ma_position;
        this.setPartirDeMaPosition = setPartirDeMaPosition;
    }

    fixerPartirDeMaPosition(val: boolean) {
        this.setPartirDeMaPosition(val);
    }

    getDépart(){
        if (this.partir_de_ma_position && this.ma_position && this.carte){
            return lieuOfJson(
                {
                    type_étape: "ma-position",
                    géom: this.ma_position,
                    nom: "Ma position",
                },
                this.carte
            )
        } else {
            return this.départ.étape
        }
    }

    // Indique si on peut calculer un itinéraire
    calculPossible(){
        return this.arrivée.étape && (this.partir_de_ma_position || this.départ.étape)
    }

    // Renvoie la liste de toutes les étapes
    toutes_les_étapes(): Étape[] {
        return [this.getDépart(), this.étape_pas_clic.étape, ...this.étapes_clic, this.arrivée.étape]
            .filter(é => é) as Étape[];
    }


    // Effet: màj le numéro de toutes les étapes clic
    màjNuméros() {
        let i = 0;
        this.étapes_clic.forEach(
            é => {
                i++;
                é.setNuméro(i);
            }
        )
    }


    insèreÉtapeClic(i: number, étape: ÉtapeClic) {
        this.setÉtapesClic(
            prev => {
                prev.splice(i, 0, étape);
                this.màjNuméros();
                return [...prev];
            }
        )
    }

    // Supprime l’étape d’indice i *dans toutes_les_étapes*
    supprimeÉtapeClic(i: number) {
        this.setÉtapesClic(prev => {
            prev.splice(i - 1, 1);
            this.màjNuméros();
            return [...prev];
        }
        )
    }


    changeÉtape(gère_étape: GèreUneÉtape, value: LieuJson | null) {

        // Crée, enregistre et récupère l’objet Étape
        const étape = gère_étape.setÉtapeÀPartirDuJson(value, this);


        this.ménageAprèsChangeÉtape();

        return étape;
    }

    ménageAprèsChangeÉtape() {
        // Supprime les anciens itinéraires
        videItinéraires(this.itinéraires, this.étapes_clic, this.setStats);

        // Ajuste la fenêtre
        ajusteFenêtre(this.toutes_les_étapes(), this.carte as L.Map);
    }


    changeDépart(départ_j: LieuJson | null) {
        const étape_départ = this.changeÉtape(this.départ, départ_j);
        // Mettre l’icône ""vélo""
        if (étape_départ instanceof Lieu && étape_départ.leaflet_layer instanceof L.Marker) {
            étape_départ.leaflet_layer.setIcon(iconeFa("bicycle"));
        }
    }

    changeArrivée(arrivée: LieuJson | null) {
        this.changeÉtape(this.arrivée, arrivée);
    }

    changeÉtapePasClic(étape: LieuJson | null) {
        this.changeÉtape(this.étape_pas_clic, étape);
    }


    // Inverse l’ordre des étapes
    inverse() {
        const ancien_départ = this.départ.étape_json;
        const ancienne_arrivée = this.arrivée.étape_json;

        this.changeÉtape(this.départ, ancienne_arrivée);
        this.changeÉtape(this.arrivée, ancien_départ);
        this.setÉtapesClic(
            prev => {
                prev.reverse();
                this.màjNuméros();
                return prev;
            }
        );
    }
}



const geo = navigator.geolocation;

export default function useÉtapes(carte: L.Map | null, itinéraires: Itinéraire[], setStats: React.Dispatch<React.SetStateAction<ReactNode>>) {


    const gère_arrivée = useÉtape(carte)
    const gère_départ = useÉtape(carte);
    const gère_étape_pas_clic = useÉtape(carte);
    const [étapes_clic, setÉtapesClic] = useState<ÉtapeClic[]>([]);

    const [partir_de_ma_position, setPartirDeMaPosition] = useState(false);
    const [ma_position, setMaPosition] = useState<GéométrieOsm | null>(null);


    function onPositionChange(pos: GeolocationPosition) {
        //if (partir_de_ma_position) { // pour éviter des rendus inutiles
            setMaPosition(positionVersGeom(pos));
        //}
    }


    useEffect(() => {
        if (!geo) {
            console.log('Geolocation is not supported');
            return;
        }
        const watcher = geo.watchPosition(
            onPositionChange,
            err => console.log(err)
        );
        return () => geo.clearWatch(watcher);  // effacer le watcher quand on démonte le composant
    }, []);


    // Sera automatiquement recalculé à chaque rendu : pas besoin de le mettre dans un state
    const étapes = new Étapes(
        gère_départ,
        gère_arrivée,
        étapes_clic, setÉtapesClic,
        gère_étape_pas_clic,
        carte, itinéraires,
        setStats,
        ma_position,
        partir_de_ma_position, setPartirDeMaPosition
    );


    return { étapes };
}
