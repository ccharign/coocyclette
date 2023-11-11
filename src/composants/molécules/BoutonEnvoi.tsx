import LoadingButton from "@mui/lab/LoadingButton";
import { useContext, useState } from "react";
import { contexte_iti } from "../contextes/page-itinéraire";
import { URL_API } from "../../params";
import { màjItinéraires } from "../../fonctions/pour_leaflet";
import { GetItinéraire } from "../../classes/types";



////////////////////////////////////////////////////////////////////////
//// Le bouton chargé d’envoyer la requête de recherche d’iinéraire ////
////////////////////////////////////////////////////////////////////////



type propsBoutonEnvoi = {
    texte: string,
    disabled: boolean,
}



export default function BoutonEnvoi({ texte, disabled }: propsBoutonEnvoi) {

    
    const { zone, setTiroir, carte, itinéraires, étapes } = useContext(contexte_iti);
    const [iti_en_chargement, setItiEnChargement] = useState(false);

    
    // màj la liste de toutes les étapes via setToutesLesÉtapes
    // et lance la recherche d’itinéraires
    async function envoieForm() {

        setItiEnChargement(true);

        try {
            //const toutes_les_étapes = [départ, ...étapes_clic, étapes_pas_clic, arrivée].filter(x => x) as Lieu[];
            // setToutesLesÉtapes(toutes_les_étapes);
            const étapes_django = étapes.toutes_les_étapes().map(é => é.pourDjango());
            const url = new URL(`${URL_API}itineraire/${zone}`);
            url.searchParams.append("étapes_str", JSON.stringify(étapes_django));
            const res = await (fetch(url).then(res => res.json())) as GetItinéraire[];
            màjItinéraires(res, carte as L.Map, itinéraires);
            //setDonnéesModifiées(false);
            setTiroir("contribuer", true);
            

        } catch (error) {
            console.log(error);
        } finally {
            setItiEnChargement(false);
            setTiroir("recherche", false);
        }
    }



    return (
        <LoadingButton
            type="submit"
            variant="contained"
            disabled={disabled}
            loading={iti_en_chargement}
            onClick={envoieForm}
        >
            {texte}
        </LoadingButton>
    )
}
