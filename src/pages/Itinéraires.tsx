import Base from "../../src/layouts/base"
import { useState } from "react";
import L from "leaflet";
import FormItinéraires from "../composants/forms/FormItinéraires.tsx";
import FormContribuer from "../composants/forms/FormContribuer.tsx";
import { Nav, Row } from "react-bootstrap";
import { tZoneAffichage, tTiroir, tTiroirOuvert } from "../classes/types.ts";
import CarteItinéraires from "../composants/organismes/CarteItinéraire.tsx";
import { contexte_iti, tContexteItinéraire } from "../composants/contextes/page-itinéraire.ts";
import { Itinéraire } from "../classes/Itinéraire.ts";
import Tiroir from "../composants/atomes/Tiroir.tsx";
import useÉtapes from "../hooks/useÉtapes.ts";
import { Button } from "@mui/material";


////////////////////////////////////////
/* Page principale de l’appli.*/
////////////////////////////////////////


type propsItinéraires = {
    fouine?: boolean
};

type tClefTiroir = "recherche" | "stats";
const clefs_tiroirs: tClefTiroir[] = ["recherche", "stats"];


type tTiroirs = {
    recherche: tTiroir,
    //contribuer: tTiroir,
    stats: tTiroir,

}


const tiroirs: tTiroirs =
{
    recherche: { nom: "Modifier la recherche", ancre: "left", contenu: "" },
    //contribuer: { nom: "Contribuer", ancre: "top", contenu: "", variant: "permanent" },
    stats: { nom: "Stats", ancre: "right", contenu: "Un jour il y aura ici les stats sur les itinéraires proposés" },
}

const itinéraires: Itinéraire[] = [];

//const toutes_les_étapes: Étape[] = [];




export default function Itinéraires({ fouine }: propsItinéraires) {

    const [carte, setCarte] = useState<L.Map | null>(null);
    const [zone, setZone] = useState<string>("");
    //const [toutes_les_étapes, setToutesLesÉtapes] = useState<Étape[]>([]);
    const { étapes, étapesReducer } = useÉtapes(carte, itinéraires);

    const [tiroir_ouvert, setTiroirOuvert] = useState<tTiroirOuvert>(
        new Map(clefs_tiroirs.map(clef => [clef, clef === "recherche"]))  // Initialement, seule la barre de recherche est ouverte.
    );


    // Renvoie la fonction qui change l’état du tiroir associé à la clef
    function toggleTiroir(clef: tZoneAffichage): () => void {
        return () =>
            setTiroirOuvert(
                prev => new Map(prev.set(clef, !prev.get(clef)))
            )
    }

    // Fixe l’état du tiroir
    function setTiroir(clef: tZoneAffichage, ouvert: boolean) {
        setTiroirOuvert(
            prev => new Map(prev.set(clef, ouvert))
        )
    }


    // Le tiroir « Recherche »
    tiroirs.recherche.contenu =
        carte &&
        <div className={fouine ? "fouine" : ""}>
            <FormItinéraires
                setZone={setZone}
                étapesReducer={étapesReducer}
            />
        </div >
        ;


    // Le tiroir « Contribuer »
    /* tiroirs.contribuer.contenu =
*     étapes.arrivée && étapes.départ && !étapes.étape_pas_clic
*         // Affichage de la partie « Contribuer » ssi départ et arrivée remplis
*         ? <FormContribuer />
*         : null; */



    // La barre pour ouvrir et fermer les tiroirs
    const éléms_menu = clefs_tiroirs.map(
        clef =>
            <Tiroir
                key={clef}
                clef={clef}
                tiroir={tiroirs[clef]}
                toggleTiroir={toggleTiroir}
                tiroir_ouvert={tiroir_ouvert}
                contenu={tiroirs[clef].contenu}
            />

    );
    éléms_menu.splice(1, 0,
        <Button
            onClick={toggleTiroir("contribuer")}
            key="contribuer"
        >
            Contribuer
        </Button>
    );
    const barreTiroirs =
        <Nav fill>
            {éléms_menu}
        </Nav >;



    // Le contexte qui va être envoyé à tous les fils
    const contexte: tContexteItinéraire = {
        carte: carte,
        zone: zone,
        étapes: étapes,
        itinéraires: itinéraires,
        setTiroir: setTiroir,
    }


    return (
        <Base>
            <contexte_iti.Provider value={contexte} >


                {barreTiroirs}


                {tiroir_ouvert.get("contribuer") &&
                    <Row>
                        <FormContribuer />
                    </Row>
                }

                <Row>
                    <CarteItinéraires
                        setCarte={setCarte}
                    />
                </Row>

            </contexte_iti.Provider>
        </Base >
    )
}
