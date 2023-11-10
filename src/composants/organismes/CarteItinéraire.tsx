

// La carte de la page principale

import { useContext, useEffect } from "react";
import carteIci from "../../fonctions/pour_leaflet";
import { contexte_iti } from "../contextes/page-itinéraire";

type propsCarte = {
    setCarte: React.Dispatch<React.SetStateAction<L.Map | null>>;
}


export default function CarteItinéraires({ setCarte }: propsCarte) {
    

    const { carte } = useContext(contexte_iti);

    // On crée la carte dès que le composant est monté pour que le div adéquat existe
    useEffect(
        () => {
            if (!carte) {
                const laCarte = carteIci();
                setCarte(laCarte);
            }
        },
        []
    );


    return (
        <div id="laCarte">
        </div>
    )
}
