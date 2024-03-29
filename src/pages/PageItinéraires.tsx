import Base from "../../src/layouts/base"
import { ReactNode, useState } from "react";
import L from "leaflet";
import FormItinéraires from "../composants/forms/FormItinéraires.tsx";
import FormContribuer from "../composants/forms/FormContribuer.tsx";
import { Nav, Row } from "react-bootstrap";
import { tZoneAffichage, tTiroir, tTiroirOuvert } from "../classes/types.ts";
import CarteItinéraires from "../composants/organismes/CarteItinéraire.tsx";
import { tContexteItinéraire } from "../contextes/ctx-page-itinéraire.ts";
import { contexte_iti } from "../contextes/ctx-page-itinéraire.ts";
import { Itinéraire } from "../classes/Itinéraire.tsx";
import Tiroir from "../composants/atomes/Tiroir.tsx";
import useÉtapes from "../hooks/useÉtapes.ts";
import { Button } from "@mui/material";
import { contribuerPossible } from "../fonctions/utils.ts";
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';




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
    //contribuer: { nom: "Contribuer", ancre: "top", contenu: "" },
    stats: { nom: "Stats", ancre: "right", contenu: "" },
}

const itinéraires: Itinéraire[] = [];




export default function PageItinéraires({ fouine }: propsItinéraires) {

    const [carte, setCarte] = useState<L.Map | null>(null);
    const [zone, setZone] = useState<string>("");

    const [stats, setStats] = useState<ReactNode>("Pas d’itinéraire pour l’instant.");
    tiroirs.stats.contenu = stats;
    const { étapes } = useÉtapes(carte, itinéraires, setStats);

    const [tiroir_ouvert, setTiroirOuvert] = useState<tTiroirOuvert>(
        new Map(clefs_tiroirs.map(clef => [clef, clef === "recherche"]))  // Initialement, seule la barre de recherche est ouverte.
    );


    // Renvoie la fonction qui change l’état du tiroir associé à la clef
    function toggleTiroir(clef: tZoneAffichage): () => void {
        return () => {
            if (clef !== "contribuer" || contribuerPossible(étapes)) {
                setTiroirOuvert(
                    prev => new Map(prev.set(clef, !prev.get(clef)))
                )
            }
        }
    }

    // Fixe l’état du tiroir
    function setTiroir(clef: tZoneAffichage, ouvert: boolean) {
        if (clef !== "contribuer" || contribuerPossible(étapes)) {
            setTiroirOuvert(
                prev => new Map(prev.set(clef, ouvert))
            )
        }
    }


    // Le tiroir « Recherche »
    tiroirs.recherche.contenu =
        carte &&
        <div className={fouine ? "fouine" : ""}>
            <FormItinéraires
                setZone={setZone}
            />
        </div >
        ;




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
            disabled={!contribuerPossible(étapes)}
        >
            {tiroir_ouvert.get("contribuer")
                ? <KeyboardDoubleArrowUpIcon />
                : <KeyboardDoubleArrowDownIcon />}
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
        setStats: setStats,
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
