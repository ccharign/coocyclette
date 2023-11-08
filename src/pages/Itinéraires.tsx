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
import { tClefTiroir, tTiroir, tTiroirOuvert } from "../classes/types.ts";


////////////////////////////////////////
/* Page principale de l’appli.*/
////////////////////////////////////////


const marqueurs = new L.LayerGroup();

type propsItinéraires = {
    fouine?: boolean
};

const clefs_tiroirs: tClefTiroir[] = ["recherche", "contribuer", "stats"];

type tTiroirs = {
    recherche: tTiroir,
    contribuer: tTiroir,
    stats: tTiroir,
}


const tiroirs: tTiroirs =
{
    recherche: { nom: "Modifier la recherche", ancre: "left", contenu: "" },
    contribuer: { nom: "Contribuer", ancre: "top", contenu: "" },
    stats: { nom: "Stats", ancre: "right", contenu: "Un jour il y aura ici les stats sur les itinéraires proposés" },
}






export default function Itinéraires({ fouine }: propsItinéraires) {

    const [carte, setCarte] = useState<L.Map | null>(null);
    const [zone, setZone] = useState("");
    const [toutes_les_étapes, setToutesLesÉtapes] = useState<Étape[]>([]);
    const [iti_en_chargement, setItiEnChargement] = useState(false);
    const [tiroir_ouvert, setTiroirOuvert] = useState<tTiroirOuvert>(
        new Map(clefs_tiroirs.map(clef => [clef, clef === "recherche"]))  // Initialement, seule la barre de recherche est ouverte.
    );

    
    // Renvoie la fonction qui ouvre ou ferme le tiroir associé à la clef
    function toggleTiroir(clef: tClefTiroir): () => void {
        return () =>
            setTiroirOuvert(
                prev => new Map(prev.set(clef, !prev.get(clef)))
            )
    }

    function setTiroir(clef: tClefTiroir, ouvert: boolean){
        setTiroirOuvert(
            prev => new Map(prev.set(clef, ouvert))
        )
    }


    tiroirs.recherche.contenu =
        carte !== null
            ?
            <FormItinéraires
                marqueurs={marqueurs}
                carte={carte}
                zone={zone}
                setZone={setZone}
                toutes_les_étapes={toutes_les_étapes}
                setToutesLesÉtapes={setToutesLesÉtapes}
                setItiEnChargement={setItiEnChargement}
                iti_en_chargement={iti_en_chargement}
                setTiroir={setTiroir}
            />
            : null;


    tiroirs.contribuer.contenu =
        toutes_les_étapes.length > 1 && toutes_les_étapes.every(é => é instanceof Lieu) ?
            // Affichage de la partie « Contribuer » ssi départ et arrivée remplis
            <Row className="my-3">

                <FormContribuer
                    toutes_les_étapes={toutes_les_étapes as Lieu[]}
                    zone={zone}
                />
            </Row>
            : null;


    // La barre pour ouvrir et fermer les tiroirs
    const barreTiroirs =
        <Nav fill>
            {
                clefs_tiroirs.map(
                    clef =>
                        <Tiroir
                            key={clef}
                            clef={clef}
                            tiroir={tiroirs[clef]}
                            toggleTiroir={toggleTiroir}
                            tiroir_ouvert={tiroir_ouvert}
                            contenu={tiroirs[clef].contenu}
                        />

                )
            }
        </Nav >;


    return (
        <Base>

            {barreTiroirs}


            <Container >

                <Row className="my-3">



                    <Carte
                        carte={carte}
                        setCarte={setCarte}
                        layers_groups={[marqueurs]}
                    />


                </Row>



            </Container>


        </Base >
    )
}
