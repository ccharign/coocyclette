import Base from "../../src/layouts/base"
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Carte from "../composants/carte.tsx";
import { useState } from "react";
import L from "leaflet";
import FormItinéraires from "../composants/forms/FormItinéraires.tsx";
import FormContribuer from "../composants/forms/FormContribuer.tsx";
import { Lieu, Étape } from "../classes/lieux.ts";




////////////////////////////////////////
/* Page principale de l’appli.*/
////////////////////////////////////////

const marqueurs = new L.LayerGroup();

type propsItinéraires = {
    fouine?: boolean
};

export default function Itinéraires({ fouine }: propsItinéraires) {

    const [carte, setCarte] = useState<L.Map | null>(null);
    const [zone, setZone] = useState("");
    const [toutes_les_étapes, setToutesLesÉtapes] = useState<Étape[]>([]);
    const [iti_en_chargement, setItiEnChargement] = useState(false);
    //const [marqueurs,] = useState(new L.LayerGroup());
    //const [itinéraires,] = useState(new L.LayerGroup());

    return (
        <Base>

            <Container >
                {
                    toutes_les_étapes.length > 1 && toutes_les_étapes.every(é => é instanceof Lieu) ?
                        // Affichage de la partie « Contribuer » ssi départ et arrivée remplis
                        <Row className="my-3">

                            <FormContribuer
                                toutes_les_étapes={toutes_les_étapes as Lieu[]}
                                zone={zone}
                            />
                        </Row>
                        : null
                }
                <Row className="my-3">

                    <Col className={fouine ? "fouine" : ""}>  {/* // cheat code pour avoir une image de fouine */}
                    {carte !== null
                        ? <FormItinéraires
                            marqueurs={marqueurs}
                            carte={carte}
                            zone={zone}
                            setZone={setZone}
                            toutes_les_étapes={toutes_les_étapes}
                            setToutesLesÉtapes={setToutesLesÉtapes}
                            setItiEnChargement={setItiEnChargement}
                            iti_en_chargement={iti_en_chargement}
                        />
                        : null}


                </Col>

                <Col md={9} >
                    <Carte
                        carte={carte}
                        setCarte={setCarte}
                        layers_groups={[marqueurs]}
                    />
                </Col>

            </Row>



        </Container>


        </Base >
    )
}
