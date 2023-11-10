import { FormEvent, useContext, useEffect, useState } from "react";
import ChoixZone from "../molécules/choixZone";
import AutoComplèteDistant from "../molécules/autoComplèteDistant"
import { Étape, Lieu } from "../../classes/lieux";
import { ÉtapeClic } from "../../classes/ÉtapeClic";
import {  GetItinéraire, tClefTiroir } from "../../classes/types";
import LoadingButton from '@mui/lab/LoadingButton';
//import SwapVertIcon from '@mui/icons-material/SwapVert';

import L from "leaflet";
import { URL_API } from "../../params";
import { Container, Row, Col } from "react-bootstrap";
import { iconeFa } from "../../classes/iconeFa";
import { contexte_iti } from "../contextes/page-itinéraire";
import { màjItinéraires } from "../../fonctions/pour_leaflet";


export type propsFormItinéraires = {
    setZone: React.Dispatch<React.SetStateAction<string>>,
    setToutesLesÉtapes: React.Dispatch<React.SetStateAction<Étape[]>>,
    setItiEnChargement: React.Dispatch<React.SetStateAction<boolean>>,
    iti_en_chargement: boolean,
    setTiroir: (clef: tClefTiroir, ouvert: boolean) => void,
}



export default function FormItinéraires(
    { setZone, setToutesLesÉtapes, setItiEnChargement, iti_en_chargement, setTiroir }:
        propsFormItinéraires) {

    const { zone, carte, itinéraires } = useContext(contexte_iti);

    const [étapes_clic, setÉtapesClic] = useState<ÉtapeClic[]>([]);  // étapes créées par clic
    const [départ, setDépart] = useState<Étape | undefined>(undefined);
    const [arrivée, setArrivée] = useState<Étape | undefined>(undefined);
    const [étapes_pas_clic, setÉtapePasClic] = useState<Étape | undefined>(undefined);
    const [données_modifiées, setDonnéesModifiées] = useState(true); // Indique si des modifs ont été faites depuis le dernier calcul d’itinéraire




    // màj la liste de toutes les étapes via setToutesLesÉtapes
    // et lance la recherche d’itinéraires
    async function envoieForm(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setItiEnChargement(true);
        setTiroir("recherche", false);
        try {
            const toutes_les_étapes = [départ, ...étapes_clic, étapes_pas_clic, arrivée].filter(x => x) as Lieu[];
            setToutesLesÉtapes(toutes_les_étapes);
            const étapes_django = toutes_les_étapes.map(é => é.pourDjango());
            const url = new URL(`${URL_API}itineraire/${zone}`);
            url.searchParams.append("étapes_str", JSON.stringify(étapes_django));
            const res = await (fetch(url).then(res => res.json())) as GetItinéraire[];
            màjItinéraires(res, carte as L.Map, itinéraires);
            setDonnéesModifiées(false);
            setTiroir("stats", true);
            setTiroir("contribuer", true);

        } catch (error) {
            console.log(error);
        } finally {
            setItiEnChargement(false);
        }
    }



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
                    e => {
                        setDonnéesModifiées(true);
                        new ÉtapeClic(
                            e.latlng,
                            [départ, ...étapes_clic, arrivée],
                            setÉtapesClic,
                            carte,
                            setDonnéesModifiées
                        );
                    },
                )
            } else if(carte){
                carte.off("click");
            }
        },
        [carte, étapes_clic] // étapes change dès que départ ou arrivée change -> inutile de mettre ceux-ci dans les déps
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

    const propsDesAutocomplètes = {
        étapes_clic: étapes_clic,
        setÉtapesClic: setÉtapesClic,
        setDonnéesModifiées: setDonnéesModifiées,
    }

    return (
        <form onSubmit={envoieForm}>
            <Container>


                <Row className="my-3">
                    <Col>
                        <ChoixZone
                            setZone={setZone}
                            zone={zone}
                        />
                    </Col>
                </Row>


                <Row className="my-3">


                    <AutoComplèteDistant
                        {...propsDesAutocomplètes}
                        étape={départ}
                        setÉtape={setDépart}
                        label="Départ"
                        placeHolder="2 rue bidule, mon café, ..."
                    />

                    {/* <IconButton
                            onClick={inverseÉtapes}
                        >
                            <SwapVertIcon />
                        </IconButton> */}

                    <AutoComplèteDistant
                        {...propsDesAutocomplètes}
                        étape={arrivée}
                        setÉtape={setArrivée}
                        label="Arrivée"
                        placeHolder="une boulangerie, 3 rue truc, ..."
                    />

                </Row>


                <Row className="my-3">
                    <Col >
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            disabled={!départ || !arrivée || !données_modifiées}
                            loading={iti_en_chargement}
                        >
                            {itinéraires.length ? "Recalculer" : "C’est parti !"}
                        </LoadingButton>
                    </Col>
                </Row>

                <Row>
                    <AutoComplèteDistant
                        {...propsDesAutocomplètes}
                        étape={étapes_pas_clic}
                        setÉtape={setÉtapePasClic}
                        label="(Option) passer par un(e):"
                        placeHolder="Essayer 'boulangerie', 'lieu où', ..."
                    />
                </Row>

            </Container>
        </form>
    );
}
