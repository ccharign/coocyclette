import Base from "../../src/layouts/base"
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Carte from "../composants/carte.tsx";
import { useEffect, useState } from "react";
import L from "leaflet";
import FormItinéraires from "../composants/forms/itinéraires.tsx";
import { ÉtapeClic } from "../classes/lieux.ts"


export default function Itinéraires() {

    let [carte, setCarte] = useState<L.Map | null>(null);
    const marqueurs = new L.LayerGroup();
    const itinéraires = new L.LayerGroup();

    return (
        <Base>
            <p>Recherche d’itinéraires</p>

            <Container>
                <Row>

                    <Col md={9} >
                        <Carte carte={carte} setCarte={setCarte} layers_groups={[marqueurs, itinéraires]} />
                    </Col>

                    <Col>
                        {carte !== null ? <FormItinéraires marqueurs={marqueurs} carte={carte} itinéraires={itinéraires} /> : null}
                    </Col>

                </Row>
            </Container>


        </Base>
    )
}
