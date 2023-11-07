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
import { Nav } from "react-bootstrap";
import Tiroir from "../composants/atomes/ClefTiroir.tsx";
import { tTiroir, tTiroirOuvert } from "../classes/types.ts";


////////////////////////////////////////
/* Page principale de l’appli.*/
////////////////////////////////////////


const marqueurs = new L.LayerGroup();

type propsItinéraires = {
    fouine?: boolean
};


const tiroirs: tTiroir[] = [
    { nom: "Modifier la recherche", clef: "recherche", ancre: "left", contenu: "" },
    { nom: "Contribuer", clef: "contribuer", ancre: "top", contenu: "" },
    { nom: "Stats", clef: "stats", ancre: "right", contenu: "" },
]






export default function Itinéraires({ fouine }: propsItinéraires) {

    const [carte, setCarte] = useState<L.Map | null>(null);
    const [zone, setZone] = useState("");
    const [toutes_les_étapes, setToutesLesÉtapes] = useState<Étape[]>([]);
    const [iti_en_chargement, setItiEnChargement] = useState(false);
    const [tiroir_ouvert, setTiroirOuvert] = useState<tTiroirOuvert>(new Map(tiroirs.map(t => [t.clef, false])));


    // La barre pour ouvrir et fermer les tiroirs
    const barreTiroirs =
        <Nav fill>
            {
                tiroirs.map(
                    tiroir =>
                        <Tiroir
                            key={tiroir.clef}
                            tiroir={tiroir}
                            setTiroirOuvert={setTiroirOuvert}
                            tiroir_ouvert={tiroir_ouvert}
                        />

                )
            }
        </Nav >;



    return (
        <Base>

            {barreTiroirs}


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
