import { useContext, useState } from "react";
import ChoixZone from "../molécules/choixZone";
import AutoComplèteDistant from "../molécules/autoComplèteDistant"
import Lieu from "../../classes/Lieu";
import { ÉtapeClic } from "../../classes/ÉtapeClic";

import SwapVertIcon from '@mui/icons-material/SwapVert';

import { Container, Row, Col } from "react-bootstrap";
import { contexte_iti } from "../../contextes/ctx-page-itinéraire";
import BoutonEnvoi from "../molécules/BoutonEnvoi";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";


export type propsFormItinéraires = {
    setZone: React.Dispatch<React.SetStateAction<string>>,
}



export default function FormItinéraires({ setZone }: propsFormItinéraires) {

    const { zone, carte, étapes } = useContext(contexte_iti);
    const [données_modifiées, setDonnéesModifiées] = useState(true); // Indique si des modifs ont été faites depuis le dernier calcul d’itinéraire
    const [partir_de_ma_postion, setPartirDeMaPosition] = useState(false);


    function changePartirDeMaPosition(event: React.ChangeEvent<HTMLInputElement>) {
        setPartirDeMaPosition(event.target.checked);
        if (event.target.checked) {
            étapes.changeDépart({
                type_étape: "ma-position",
                nom: "Ma position",
                géom: [[0,0]],
            });
        }else{
            étapes.changeDépart(null);
        }
    }

    // Change l’icone pour le départ
    // TODO mettre icone en arg facultatif de autocomplèteDistant
    /* useEffect(
*     () => {
*         const étape_départ = étapes.départ.étape;
*         if (étape_départ instanceof Lieu && étape_départ.leaflet_layer instanceof L.Marker) {
*             étape_départ.
*         }
*     }
* )
 */

    // Lance la gestion des clics
    if (carte && étapes.départ.étape instanceof Lieu && étapes.arrivée.étape instanceof Lieu && !étapes.étape_pas_clic.étape) {
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
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={partir_de_ma_postion}
                                onChange={changePartirDeMaPosition}
                            />
                        }
                        label="Partir de ma position"
                    />

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
