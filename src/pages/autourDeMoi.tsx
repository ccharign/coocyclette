import Base from "../layouts/base.tsx";
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useState } from "react";
import FormAutourDeMoi from "../composants/forms/autourDeMoi.tsx";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Carte from "../composants/carte.tsx";



// Page « Autour de moi »
// Une carte et un formulaire pour chercher des lieux.

const marqueurs = new L.LayerGroup();

export default function AutourDeMoi() {

    let [carte, setCarte] = useState<L.Map | null>(null);


    return (
	<Base>
            <Container>
                <Row>
                    
                    <Col md={9} >
                    <Carte carte={carte} setCarte={setCarte} layers_groups={[marqueurs]} />
	            </Col>
                    
                    <Col>
	                {carte ? <FormAutourDeMoi carte={carte as L.Map} marqueurs={marqueurs} /> : null}
                    </Col>
                    
                </Row>
            </Container>
            
	</Base>
    )
}
