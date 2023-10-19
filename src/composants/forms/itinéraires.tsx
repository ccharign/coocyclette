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
}


export default function FormItinéraires(props: propsFormItinéraires) {

    const [zone, setZone] = useState("");
    const [étapes, setÉtapes] = useState<ÉtapeClic[]>([]);
    const [départ, setDépart] = useState<Lieu | undefined>(undefined);
    const [arrivée, setArrivée] = useState<Lieu | undefined>(undefined);


    // Renvoie la liste de toutes les étapes, départ et arrivée comprises
    function toutesLesÉtapes(): Lieu[] {
        return [
            ...(départ ? [départ] : []),
            ...étapes,
            ...(arrivée ? [arrivée] : [])
        ];
    }

    
    // Ajuste la fenêtre de la carte pour avoir toutes les étapes à l’écran
    function ajusteFenêtre() {
        const étapes = toutesLesÉtapes().map(lieu => lieu.coords);

        if (étapes.length === 1) {
            props.carte.setView(étapes[0]);
        } else if (étapes.length > 1) {
            props.carte.fitBounds(L.latLngBounds(étapes));
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
        props.itinéraires.clearLayers();
        itis.forEach(
            iti => props.itinéraires.addLayer(itiToPolyline(iti))
        );
        props.itinéraires.addTo(props.carte);
        console.log("Itinéraires chargés.", props.itinéraires);
    }


    async function envoieForm(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const étapes_django = toutesLesÉtapes().map(é => é.pourDjango());
        const url = new URL(`${URL_API}itineraire/${zone}`);
        url.searchParams.append("étapes_str", JSON.stringify(étapes_django));
        const res = await (fetch(url).then(res => res.json())) as Itinéraire[];
        màjItinéraires(res);
    }


    // Renvoie la fonction onChange à utiliser pour l’étape indiquée
    function fonctionOnChangeÉtape(étape_préc: Lieu | undefined, setÉtape: React.Dispatch<React.SetStateAction<Lieu | undefined>>) {
        return (
            (_truc: SyntheticEvent<Element>, value: LieuJson | null, _reason: AutocompleteChangeReason) => {
                if (value) {
                    const étape = Lieu.from_json(value);
                    if (étape_préc) {
                        étape_préc.leaflet_layer.remove();
                    }
                    setÉtape(étape);
                    props.marqueurs.addLayer(étape.leaflet_layer);
                    props.marqueurs.addTo(props.carte);
                }
            }
        )
    }

    
    // Recadre la carte quand départ ou arrivée change
    useEffect(
        ajusteFenêtre,
        [départ, arrivée]
    );

    // Lance la gestion des clics
    useEffect(
        () => {
            if (props.carte && départ && arrivée) {
                props.carte.on("click", e => {
                    new ÉtapeClic(e.latlng, [départ, ...étapes, arrivée], setÉtapes, props.marqueurs);
                })
            }
        },
        [props.carte, départ, arrivée, étapes]
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

            <Button type="submit" variant="contained">C’est parti ! </Button>

        </form>
    );
}
