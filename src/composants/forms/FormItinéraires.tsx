import { FormEvent, SyntheticEvent, useEffect, useState } from "react";
import ChoixZone from "../molécules/choixZone";
import AutoComplèteDistant from "../molécules/autoComplèteDistant"
import { ÉtapeClic, Lieu } from "../../classes/lieux";
import { LieuJson, GetItinéraire } from "../../classes/types";
import { AutocompleteChangeReason } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';

import L from "leaflet";
import { URL_API } from "../../params";
import { Container, Row, Col } from "react-bootstrap";
import { Itinéraire } from "../../classes/Itinéraire";


export type propsFormItinéraires = {
    marqueurs: L.LayerGroup,
    carte: L.Map,
    itinéraires: L.LayerGroup,
    zone: string,
    setZone: React.Dispatch<React.SetStateAction<string>>,
    toutes_les_étapes: Lieu[],
    setToutesLesÉtapes: React.Dispatch<React.SetStateAction<Lieu[]>>,
    setItiEnChargement: React.Dispatch<React.SetStateAction<boolean>>,
    iti_en_chargement: boolean,
}


export default function FormItinéraires(
    { marqueurs, carte, itinéraires, zone, setZone, setToutesLesÉtapes, setItiEnChargement, iti_en_chargement }:
        propsFormItinéraires) {


    const [étapes, setÉtapes] = useState<ÉtapeClic[]>([]);  // étapes intermédiaires
    const [départ, setDépart] = useState<Lieu | undefined>(undefined);
    const [arrivée, setArrivée] = useState<Lieu | undefined>(undefined);


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
    function itiToPolyline(iti: GetItinéraire): L.Polyline {
        return new Itinéraire(iti).polyline;
    }


    // Efface les anciens itinéraires et affiche les nouveaux
    function màjItinéraires(itis: GetItinéraire[]) {
        
        itinéraires.clearLayers();

        itis.forEach(
            iti => itinéraires.addLayer(itiToPolyline(iti))
        );
        itinéraires.addTo(carte);
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
        const res = await (fetch(url).then(res => res.json())) as GetItinéraire[];
        màjItinéraires(res);
        setItiEnChargement(false);
    }


    // Supprime les étapes intermédiaires et les itinéraires
    function videItinéraires() {
        itinéraires.clearLayers();
        étapes.forEach(
            l => l.leaflet_layer.remove()
        );
        étapes.length = 0;
        setÉtapes([]);
    }


    // Renvoie la fonction onChange à utiliser pour l’étape indiquée (départ ou arrivée)
    function fonctionOnChangeÉtape(setÉtape: React.Dispatch<React.SetStateAction<Lieu | undefined>>) {
        return (
            (_truc: SyntheticEvent<Element>, value: LieuJson | null, _reason: AutocompleteChangeReason) => {

                videItinéraires();
                if (value) {
                    const étape = Lieu.from_json(value);
                    setÉtape(prev => {
                        prev?.leaflet_layer.remove();
                        return étape;
                    });
                    marqueurs.addLayer(étape.leaflet_layer);
                    marqueurs.addTo(carte);
                } else {
                    setÉtape(prev => {
                        prev?.leaflet_layer.remove();
                        return undefined;
                    }
                    );
                }

            }
        )
    }


    // Recadre la fenêtre quand départ ou arrivée change
    useEffect(
        ajusteFenêtre
        ,
        [départ, arrivée]
    );


    // Lance la gestion des clics
    // TODO sans doute simplifiable !
    useEffect(
        () => {
            if (carte && départ && arrivée) {
                carte.off("click");
                carte.on(
                    "click",
                    e => { new ÉtapeClic(e.latlng, [départ, ...étapes, arrivée], setÉtapes, marqueurs); },
                )
            } else {
                carte.off("click");
            }
        },
        [carte, étapes] // étapes change dès que départ ou arrivée change -> inutile de mettre ceux-ci dans les déps
    )


    return (
        <form onSubmit={envoieForm}>
            <Container>


                <Row className="my-3">
                    <Col>
                        <ChoixZone setZone={setZone} />
                    </Col>
                </Row>


                <Row className="my-3">
                    <Col >
                        <AutoComplèteDistant
                            l_min={3}
                            onSelect={fonctionOnChangeÉtape(setDépart)}
                            zone={zone}
                            label="Départ"
                        />

                        <AutoComplèteDistant
                            l_min={3}
                            onSelect={fonctionOnChangeÉtape(setArrivée)}
                            zone={zone}
                            label="Arrivée"
                        />
                    </Col>
                </Row>


                <Row className="my-3">
                    <Col >
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            disabled={!départ || !arrivée}
                            loading={iti_en_chargement}
                        >
                            C’est parti !
                        </LoadingButton>
                    </Col>
                </Row>

            </Container>
        </form>
    );
}
