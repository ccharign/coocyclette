import { useContext, useEffect, useState } from "react";
import ChoixZone from "../molécules/choixZone";
import AutoComplèteDistant from "../molécules/autoComplèteDistant"
import { Lieu } from "../../classes/lieux";
import { ÉtapeClic } from "../../classes/ÉtapeClic";

//import SwapVertIcon from '@mui/icons-material/SwapVert';

import L from "leaflet";
import { Container, Row, Col } from "react-bootstrap";
import { iconeFa } from "../../classes/iconeFa";
import { contexte_iti } from "../contextes/page-itinéraire";
import BoutonEnvoi from "../molécules/BoutonEnvoi";

import { ActionÉtape } from "../../hooks/useÉtapes";


export type propsFormItinéraires = {
    setZone: React.Dispatch<React.SetStateAction<string>>,
    //setToutesLesÉtapes: React.Dispatch<React.SetStateAction<Étape[]>>,
    //setItiEnChargement: React.Dispatch<React.SetStateAction<boolean>>,
    //iti_en_chargement: boolean,
    étapesReducer: (action: ActionÉtape) => void,
}



export default function FormItinéraires({ setZone, étapesReducer }: propsFormItinéraires) {

    const { zone, carte, étapes } = useContext(contexte_iti);

    const [étapes_clic, setÉtapesClic] = useState<ÉtapeClic[]>([]);  // étapes créées par clic
    //const [départ, setDépart] = useState<Étape | undefined>(undefined);
    //const [arrivée, setArrivée] = useState<Étape | undefined>(undefined);
    //const [étapes_pas_clic, setÉtapePasClic] = useState<Étape | undefined>(undefined);
    const [données_modifiées, setDonnéesModifiées] = useState(true); // Indique si des modifs ont été faites depuis le dernier calcul d’itinéraire


    /* function fonctionOnChange(setÉtape: React.Dispatch<React.SetStateAction<Étape | undefined>>) {

*     return (value: LieuJson | null) => {

*         videItinéraires(itinéraires, étapes_clic, setÉtapesClic);

*         // Récupérer l’objet Étape
*         const étape = value ? lieuOfJson(value) : undefined;

*         // Afficher le layer leaflet
*         if (carte && étape instanceof Lieu) {
*             étape.leaflet_layer.addTo(carte);
*         }

*         // màj les données
*         setÉtape(prev => {
*             prev && prev.supprimeLeafletLayer();
*             étape && ajusteFenêtre(toutes_les_étapes.concat([étape]), carte as L.Map);
*             setToutesLesÉtapes([départ, ...étapes_clic, arrivée].filter(é => é) as Étape[])
*             return étape;
*         });
*     }
* } */


    // Change l’icone pour le départ
    // TODO mettre icone en arg facultatif de autocomplèteDistant
    useEffect(
        () => {
            if (étapes.départ instanceof Lieu && étapes.départ.leaflet_layer instanceof L.Marker) {
                étapes.départ.leaflet_layer.setIcon(iconeFa("bicycle"));
            }
        }
    )


    // Lance la gestion des clics
    if (carte && étapes.départ instanceof Lieu && étapes.arrivée instanceof Lieu && !étapes.étape_pas_clic) {
        carte.off("click");
        carte.on(
            "click",
            e => {
                setDonnéesModifiées(true);
                new ÉtapeClic(
                    e.latlng,
                    étapes.toutes_les_étapes as Lieu[],
                    étapesReducer,
                    carte,
                    setDonnéesModifiées
                );
            },
        )
    } else if (carte) {
        carte.off("click");
    }




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
                        onChange={val => étapesReducer({ cat: "set-départ", val: val })}
                    />

                    {/* <IconButton
                            onClick={inverseÉtapes}
                        >
                            <SwapVertIcon />
                        </IconButton> */}

                    <AutoComplèteDistant
                        {...propsDesAutocomplètes}
                        étape={étapes.arrivée}
                        label="Arrivée"
                        placeHolder="une boulangerie, 3 rue truc, ..."
                        onChange={val => étapesReducer({ cat: "set-arrivée", val: val })}
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
                        onChange={val => étapesReducer({ cat: "set-étape-pas-clic", val: val })}
                    />
                </Row>

            </Container>
        </form>
    );
}
