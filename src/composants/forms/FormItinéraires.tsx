import { FormEvent, SyntheticEvent, useEffect, useState } from "react";
import ChoixZone from "../molécules/choixZone";
import AutoComplèteDistant from "../molécules/autoComplèteDistant"
import { Étape, Lieu } from "../../classes/lieux";
import { ÉtapeClic, màjNumérosÉtapes } from "../../classes/ÉtapeClic";
import { LieuJson, GetItinéraire } from "../../classes/types";
import { AutocompleteChangeReason, IconButton } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import SwapVertIcon from '@mui/icons-material/SwapVert';

import L from "leaflet";
import { URL_API } from "../../params";
import { Container, Row, Col } from "react-bootstrap";
import { Itinéraire } from "../../classes/Itinéraire";
import { iconeFa } from "../../classes/iconeFa";
import lieuOfJson from "../../fonctions/crée-lieu";


export type propsFormItinéraires = {
    marqueurs: L.LayerGroup,
    carte: L.Map,
    //itinéraires: L.LayerGroup,
    zone: string,
    setZone: React.Dispatch<React.SetStateAction<string>>,
    toutes_les_étapes: Étape[],
    setToutesLesÉtapes: React.Dispatch<React.SetStateAction<Étape[]>>,
    setItiEnChargement: React.Dispatch<React.SetStateAction<boolean>>,
    iti_en_chargement: boolean,
}

let itinéraires: Itinéraire[] = [];


export default function FormItinéraires(
    { marqueurs, carte, zone, setZone, setToutesLesÉtapes, setItiEnChargement, iti_en_chargement }:
        propsFormItinéraires) {


    const [étapes, setÉtapes] = useState<ÉtapeClic[]>([]);  // étapes créées par clic
    const [départ, setDépart] = useState<Étape | undefined>(undefined);
    const [arrivée, setArrivée] = useState<Étape | undefined>(undefined);
    const [étapes_pas_clic, setÉtapePasClic] = useState<Étape | undefined>(undefined);


    // Ajuste la fenêtre de la carte pour avoir toutes les étapes à l’écran
    function ajusteFenêtre() {
        const étapes = [départ, arrivée]
            .flatMap(étape => étape instanceof Lieu ? [étape.coords] : []);

        if (étapes.length === 1) {
            carte.setView(étapes[0]);
        } else if (étapes.length > 1) {
            carte.fitBounds(L.latLngBounds(étapes));
        }
    }


    // renvoie l’objet polyline associé à un itinéraire
    /* function itiToPolyline(iti: GetItinéraire): L.Polyline {
*     return new Itinéraire(iti).polyline;
* } */


    // Efface les anciens itinéraires et affiche les nouveaux
    function màjItinéraires(itis: GetItinéraire[]) {

        itinéraires.forEach(
            iti => iti.supprimeLayers()
        );
        itinéraires = itis.map(
            iti => new Itinéraire(iti, carte)
        );
    }


    // màj la liste de toutes les étapes via setToutesLesÉtapes
    // et lance la recherche d’itinéraires
    async function envoieForm(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setItiEnChargement(true);
        try {
            const toutes_les_étapes = [départ, ...étapes, étapes_pas_clic, arrivée].filter(x => x) as Lieu[];
            setToutesLesÉtapes(toutes_les_étapes);
            const étapes_django = toutes_les_étapes.map(é => é.pourDjango());
            const url = new URL(`${URL_API}itineraire/${zone}`);
            url.searchParams.append("étapes_str", JSON.stringify(étapes_django));
            const res = await (fetch(url).then(res => res.json())) as GetItinéraire[];
            màjItinéraires(res);
            
        } catch(error) {
            console.log(error);
        } finally{
            setItiEnChargement(false);
        }
    }


    // Supprime les étapes intermédiaires et les itinéraires
    function videItinéraires() {
        itinéraires.forEach(
            iti => iti.supprimeLayers()
        );
        itinéraires.length = 0;
        étapes.forEach(
            l => l.leaflet_layer.remove()
        );
        étapes.length = 0;
        setÉtapes([]);
    }


    // Renvoie la fonction onChange à utiliser pour l’étape indiquée (départ ou arrivée)
    function fonctionOnChangeÉtape(setÉtape: React.Dispatch<React.SetStateAction<Étape | undefined>>) {
        return (
            (_event: SyntheticEvent<Element>, value: LieuJson | null, _reason: AutocompleteChangeReason) => {

                videItinéraires();
                if (value) {
                    const étape = lieuOfJson(value);
                    if (étape instanceof Lieu) {
                        marqueurs.addLayer(étape.leaflet_layer);
                        marqueurs.addTo(carte);
                    }
                    setÉtape(prev => {
                        prev instanceof Lieu ? prev.leaflet_layer.remove() : null;
                        return étape;
                    });

                } else {
                    setÉtape(prev => {
                        prev instanceof Lieu ? prev.leaflet_layer.remove() : null;
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

    // Change l’icone pour le départ
    useEffect(
        () => {
            if (départ instanceof Lieu && départ.leaflet_layer instanceof L.Marker) {
                départ.leaflet_layer.setIcon(iconeFa("bicycle"));
            }
        }
    )


    // Lance la gestion des clics
    // TODO sans doute simplifiable !
    useEffect(
        () => {
            if (carte && départ instanceof Lieu && arrivée instanceof Lieu && étapes_pas_clic === undefined) {
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


    /* function inverseÉtapes(_event: any): void {
*     setDépart(arrivée);
*     setArrivée(départ);
*     setÉtapes(prev=> {
*         prev.reverse();
*         màjNumérosÉtapes(prev);
*         return prev;
*     });
* }
 */

    return (
        <form onSubmit={envoieForm}>
            <Container>


                <Row className="my-3">
                    <Col>
                        <ChoixZone setZone={setZone} />
                    </Col>
                </Row>


                <Row className="my-3">





                    <AutoComplèteDistant
                        l_min={3}
                        onSelect={fonctionOnChangeÉtape(setDépart)}
                        zone={zone}
                        label="Départ"
                        placeHolder="2 rue bidule, mon café, ..."
                    />

                    {/* <IconButton
                            onClick={inverseÉtapes}
                        >
                            <SwapVertIcon />
                        </IconButton> */}

                    <AutoComplèteDistant
                        l_min={3}
                        onSelect={fonctionOnChangeÉtape(setArrivée)}
                        zone={zone}
                        label="Arrivée"
                        placeHolder="une boulangerie, 3 rue truc, ..."
                    />

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
                <Row>
                    <AutoComplèteDistant
                        l_min={3}
                        onSelect={fonctionOnChangeÉtape(setÉtapePasClic)}
                        zone={zone}
                        label="(Facultatif) passer par :"
                        placeHolder="une boulangerie, un lieu où manger, ..."
                    />
                </Row>

            </Container>
        </form>
    );
}
