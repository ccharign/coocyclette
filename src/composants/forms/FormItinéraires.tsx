import { useContext, useState } from "react";

import SwapVertIcon from '@mui/icons-material/SwapVert';
import { Container, Row, Col } from "react-bootstrap";
import IconButton from "@mui/material/IconButton";
import { FormControlLabel, Switch } from "@mui/material";

import { contexte_iti } from "../../contextes/ctx-page-itinéraire";
import BoutonEnvoi from "../molécules/BoutonEnvoi";
import ChoixZone from "../molécules/choixZone";
import AutoComplèteDistant from "../molécules/autoComplèteDistant";
import LieuAvecÉtapes from "../../classes/Lieu";
import { ÉtapeClic } from "../../classes/ÉtapeClic";

export type propsFormItinéraires = {
    setZone: React.Dispatch<React.SetStateAction<string>>,
}


export default function FormItinéraires({ setZone }: propsFormItinéraires) {

    const { zone, carte, étapes } = useContext(contexte_iti);
    const [données_modifiées, setDonnéesModifiées] = useState(true); // Indique si des modifs ont été faites depuis le dernier calcul d’itinéraire



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
        <FormControlLabel
            control={
                <Switch
                    checked={étapes.partir_de_ma_position}
                    onChange={e => étapes.fixerPartirDeMaPosition(e.target.checked)}
                />
            }
            label="Partir de ma position"
            disabled={!étapes.ma_position}
        />;

    

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
                        disabled={étapes.partir_de_ma_position}
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
                            disabled={!étapes.calculPossible() || !données_modifiées}
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
