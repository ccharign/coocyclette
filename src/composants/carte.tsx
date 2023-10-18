import L from "leaflet"
import { useEffect} from "react";
import carteIci from "../fonctions/pour_leaflet";

type propsCarte = {
    carte: L.Map|null;
    layers_groups: L.LayerGroup[];
    setCarte: React.Dispatch<React.SetStateAction<L.Map | null>>;
}


export default function Carte({ carte, setCarte, layers_groups }: propsCarte) {

    // Lie les layersGroup à la cartef
    function addLayerGroups(){
        if (carte){
            layers_groups.forEach(lg => lg.addTo(carte));
        }
    }

    // On crée la carte dès que le composant est monté pour que le div adéquat existe
    useEffect(
	() => {
	    if (!carte) {
		const laCarte=carteIci();
		setCarte(laCarte);
	    }
            },
            []
    );

    // Si la carte change on lui ré-attache ses layersGroups
    useEffect(
        addLayerGroups,
        [carte]
    );


    return (
        <div id="laCarte">
        </div>
    )
}
