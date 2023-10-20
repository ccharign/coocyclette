import { FormEvent, SyntheticEvent, useEffect, useState } from "react";
import ChoixZone from "../molécules/choixZone";
import AutoComplèteDistant from "../molécules/autoComplèteDistant"
import { Lieu, géomOsmVersLeaflet, ÉtapeClic } from "../../classes/lieux";
import { LieuJson, Itinéraire } from "../../classes/types";
import { AutocompleteChangeReason, Button } from "@mui/material";

import L from "leaflet";
import { URL_API } from "../../params";


export type propsFormItinéraires = {
    marqueurs: L.LayerGroup,
    carte: L.Map,
    itinéraires: L.LayerGroup,
    zone: string,
    setZone: React.Dispatch<React.SetStateAction<string>>,
    toutes_les_étapes: Lieu[],
    setToutesLesÉtapes: React.Dispatch<React.SetStateAction<Lieu[]>>,
    setItiEnChargement: React.Dispatch<React.SetStateAction<boolean>>,
}


export default function FormItinéraires(
    { marqueurs, carte, itinéraires, zone, setZone, setToutesLesÉtapes, setItiEnChargement }:
        propsFormItinéraires) {

    //const [zone, setZone] = useState("");
    const [étapes, setÉtapes] = useState<ÉtapeClic[]>([]);  // étapes intermédiaires
    const [départ, setDépart] = useState<Lieu | undefined>(undefined);
    const [arrivée, setArrivée] = useState<Lieu | undefined>(undefined);


    // Renvoie la liste de toutes les étapes, départ et arrivée comprises
    /* function toutesLesÉtapes(): Lieu[] {
*     return [
*         ...(départ ? [départ] : []),
*         ...étapes,
*         ...(arrivée ? [arrivée] : [])
*     ];
* }
 */

    // Ajuste la fenêtre de la carte pour avoir toutes les étapes à l’écran
    function ajusteFenêtre() {
        const étapes = [départ, arrivée]
            .flatMap(lieu => lieu ? [lieu.coords] : []);

        if (étapes.length === 1) {
            carte.setView(étapes[0]);
        } else if (étapes.length > 1) {
            carte.fitBounds(L.latLngBounds(étapes));
        }
    }


    // renvoie l’objet polyline associé à un itinéraire
    function itiToPolyline(iti: Itinéraire): L.Polyline {
        const res = new L.Polyline(
            géomOsmVersLeaflet(iti.points),
            { color: iti.couleur }
        );
        res.bindPopup(`
        Longueur: ${iti.longueur}m<br>
Pourcentage de détour: ${iti.pourcentage_détour}
        `);
        return res;
    }


    // Efface les anciens itinéraires et affiche les nouveaux
    function màjItinéraires(itis: Itinéraire[]) {
        itinéraires.clearLayers();
        itis.forEach(
            iti => itinéraires.addLayer(itiToPolyline(iti))
        );
        itinéraires.addTo(carte);
        setItiEnChargement(false);
    }

    // màj la liste de toutes les étapes via setToutesLesÉtapes
    // et lance la recherche d’itinéraires
    async function envoieForm(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setItiEnChargement(true);
        const toutes_les_étapes = [départ, ...étapes, arrivée].filter(x => x) as Lieu[];
        setToutesLesÉtapes(toutes_les_étapes);
        const étapes_django = toutes_les_étapes.map(é => é.pourDjango());
        const url = new URL(`${URL_API}itineraire/${zone}`);
        url.searchParams.append("étapes_str", JSON.stringify(étapes_django));
        const res = await (fetch(url).then(res => res.json())) as Itinéraire[];
        màjItinéraires(res);
    }


    // Renvoie la fonction onChange à utiliser pour l’étape indiquée (départ ou arrivée)
    function fonctionOnChangeÉtape(étape_préc: Lieu | undefined, setÉtape: React.Dispatch<React.SetStateAction<Lieu | undefined>>) {
        return (
            (_truc: SyntheticEvent<Element>, value: LieuJson | null, _reason: AutocompleteChangeReason) => {
                if (value) {
                    const étape = Lieu.from_json(value);
                    if (étape_préc) {
                        étape_préc.leaflet_layer.remove();
                    }
                    setÉtape(étape);
                    marqueurs.addLayer(étape.leaflet_layer);
                    marqueurs.addTo(carte);
                }
            }
        )
    }


    // Màj toutes_les_étapes
    useEffect(
        () => {
            if (départ && arrivée) {
                console.log("màj de la liste des étapes");
                setToutesLesÉtapes([départ, ...étapes, arrivée]);
            }
        },
        [départ, arrivée, étapes]
    );


    // Recadre la fenêtre quand départ ou arrivée change
    useEffect(
        ajusteFenêtre
        ,
        [départ, arrivée]
    );


    // Lance la gestion des clics
    useEffect(
        () => {
            if (carte && départ && arrivée) {
                carte.on("click", e => {
                    new ÉtapeClic(e.latlng, [départ, ...étapes, arrivée], setÉtapes, marqueurs);
                })
            }
        },
        [carte, départ, arrivée, étapes]
    )


    return (
        <form onSubmit={envoieForm}>

            <ChoixZone setZone={setZone} />

            <AutoComplèteDistant
                l_min={3}
                onSelect={fonctionOnChangeÉtape(départ, setDépart)}
                zone={zone}
                label="Départ"
            />

            <AutoComplèteDistant
                l_min={3}
                onSelect={fonctionOnChangeÉtape(arrivée, setArrivée)}
                zone={zone}
                label="Arrivée"
            />

            <Button type="submit" variant="contained">C’est parti !</Button>

        </form>
    );
}
