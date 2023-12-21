import { useContext, useState } from "react";

import SwapVertIcon from '@mui/icons-material/SwapVert';
import { Container, Row, Col } from "react-bootstrap";
import { useGeolocated } from "react-geolocated";
import IconButton from "@mui/material/IconButton";
import { Button } from "@mui/material";

import { contexte_iti } from "../../contextes/ctx-page-itinéraire";
import BoutonEnvoi from "../molécules/BoutonEnvoi";
import ChoixZone from "../molécules/choixZone";
import AutoComplèteDistant from "../molécules/autoComplèteDistant";
import LieuAvecÉtapes from "../../classes/Lieu";
import { ÉtapeClic } from "../../classes/ÉtapeClic";


export type propsFormItinéraires = {
    setZone: React.Dispatch<React.SetStateAction<string>>,
}

//const geo = navigator.geolocation;


export default function FormItinéraires({ setZone }: propsFormItinéraires) {

    const { zone, carte, étapes } = useContext(contexte_iti);
    const [données_modifiées, setDonnéesModifiées] = useState(true); // Indique si des modifs ont été faites depuis le dernier calcul d’itinéraire

    /* const [ma_position, setMaPosition] = useState<GéométrieOsm>([[0, 0]]);
* geo.watchPosition(
*     position => setMaPosition(positionVersGeom(position))
* )
     */
    const { coords, getPosition } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: true,
            },
            //userDecisionTimeout: 5000,
            watchPosition: true,
            watchLocationPermissionChange: true,
            //onError: e => alert("Erreur à la géolocalisation : " + e)
        });

    getPosition();


    function changePartirDeMaPosition() {
        if (!coords) {
            throw new Error("Localisation pas disponible");
        }
        const { longitude, latitude } = coords;

        étapes.changeDépart({
            type_étape: "ma-position",
            nom: "Ma position",
            géom: [[longitude, latitude]],
        });
    }


    // Lance la gestion des clics
    if (carte && étapes.départ.étape instanceof LieuAvecÉtapes && étapes.arrivée.étape instanceof LieuAvecÉtapes && !étapes.étape_pas_clic.étape) {
        carte.off("click");
        carte.on(
            "click",
            e => {
                setDonnéesModifiées(true);
                new ÉtapeClic(
                    e.latlng,
                    étapes,
                    carte,
                    setDonnéesModifiées
                );
            },
        )
    } else if (carte) {
        carte.off("click");
    }


    const propsDesAutocomplètes = {
        setDonnéesModifiées: setDonnéesModifiées,
    }

    const bouton_partir_de_ma_position =
        <Button
            variant="outlined"
            onClick={changePartirDeMaPosition}
            disabled={coords === undefined}
        >
            {
                (coords)
                    ? "Partir de ma position"
                    : "Géolocalisation non disponible"
            }

            {
                coords
                && ` ((${coords.longitude}, ${coords.latitude}))`
            }
        </Button>;

    return (
        <form onSubmit={e => e.preventDefault()}>
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
                        étape={étapes.départ}
                        label="Départ"
                        placeHolder="2 rue bidule, mon café, ..."
                        onChange={val => étapes.changeDépart(val)}
                    />

                    {bouton_partir_de_ma_position}

                    <IconButton
                        onClick={() => étapes.inverse()}
                    >
                        <SwapVertIcon />
                    </IconButton>

                    <AutoComplèteDistant
                        {...propsDesAutocomplètes}
                        étape={étapes.arrivée}
                        label="Arrivée"
                        placeHolder="une boulangerie, 3 rue truc, ..."
                        onChange={val => étapes.changeArrivée(val)}
                    />

                </Row>


                <Row className="my-3">
                    <Col >
                        <BoutonEnvoi
                            disabled={!étapes.départ || !étapes.arrivée || !données_modifiées}
                            texte=" C’est parti !"
                        />
                    </Col>
                </Row>

                <Row>
                    <AutoComplèteDistant
                        {...propsDesAutocomplètes}
                        étape={étapes.étape_pas_clic}
                        label="(Option) passer par un(e):"
                        placeHolder="Essayer 'boulangerie', 'lieu où', ..."
                        onChange={val => étapes.changeÉtapePasClic(val)}
                    />
                </Row>

            </Container>
        </form>
    );
}
