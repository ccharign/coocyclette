import { Navbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
export default function NavBar(){


    return(
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand as={Link} to="/coocyclette">CooCyclette</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/coocyclette/">Recherche d’itinéraire </Nav.Link>
                        <Nav.Link as={Link} to="/coocyclette/autourDeMoi">Autour de moi </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}
