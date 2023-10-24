

// Pour enregistrer une contribution
// Choisir les pourcentage_détour pertinents
// envoyer les étapes

// Besoin de :
//    les étapes
//    la zone

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { URL_API } from "../../params";
import { Lieu } from "../../classes/lieux";
import { LoadingButton } from "@mui/lab";
import { Checkbox, FormControlLabel, Switch, Tooltip } from "@mui/material";
import { FormGroup } from "react-bootstrap";

type PropsContribuer = {
    toutes_les_étapes: Lieu[],
    zone: string,
}


type PourcentageDétour = {
    pourcentage_détour: number,
    label: string,
    explication: string,
}

const pd_défaut: PourcentageDétour[] = [
    {
        pourcentage_détour: 0,
        label: "trajet direct",
        explication: "Trajet le plus court",
    },
    {
        pourcentage_détour: 20,
        label: "Intermédiaire",
        explication: "Ce type de trajet est un compromis entre vitesse et caractère agréable. Il propose en moyenne des détours de 10 à 20%."
    },
    {
        pourcentage_détour: 40,
        label: "Priorité confort",
        explication: "Ce type de trajet peut proposer des détours significatifs afin d’améliorer sa sécurité et son agrément."
    },
]


export default function FormContribuer(props: PropsContribuer) {

    const [pd_selectionnés, setPdSelectionnés] = useState(new Map(pd_défaut.map(pd => [pd.pourcentage_détour, false])));
    const [apprentissage_en_cours, setApprentissageEnCours] = useState(false);
    const ar = useRef<any>();


    function envoieForm(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setApprentissageEnCours(true);
        const étapes_django = props.toutes_les_étapes.map(é => é.pourDjango());
        const pourcentages_détour = pd_défaut.flatMap(
            pd => pd_selectionnés.get(pd.pourcentage_détour) ? [pd.pourcentage_détour] : []
        )
        const url = new URL(`${URL_API}contribuer/${props.zone}`);
        fetch(
            url,
            {
                method: "POST",
                body: JSON.stringify({
                    "étapes_str": étapes_django,
                    "pourcentages_détour": pourcentages_détour,
                    "AR": ar.current ? ar.current.value : false,
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            }
        )
            .then(res => res.json())
            .then(_res => setApprentissageEnCours(false));
    }


    function fonctionChangePdSelectionné(pourcentage_détour: number) {
        return (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
            setPdSelectionnés(
                prev => new Map(prev.set(pourcentage_détour, checked))
            )
        }
    }



    function checkboxOfPd(pd: PourcentageDétour) {
        return (
            <Tooltip title={pd.explication} key={pd.pourcentage_détour} >
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={pd_selectionnés.get(pd.pourcentage_détour)}
                            onChange={fonctionChangePdSelectionné(pd.pourcentage_détour)}
                        />
                    }
                    label={pd.label}

                />

            </Tooltip>

        )
    }


    // Cette fonction renvoie le formulaire lui-même
    const formContribuer = () =>
        <div>
            <p> Si les points de passage indiqués vous semblent pertinents pour aller de « {props.toutes_les_étapes[0].nom} » à « {props.toutes_les_étapes[props.toutes_les_étapes.length - 1].nom} » : </p>

            <form onSubmit={envoieForm}>
                <ul>

                    <li>
                        <FormControlLabel
                            label="Type(s) de trajets adapté(s) : "
                            labelPlacement="start"
                            control={
                                <FormGroup>
                                    {pd_défaut.flatMap(pd => pd.pourcentage_détour !== 0 ? [checkboxOfPd(pd)] : [])}
                                </FormGroup>
                            }
                        />

                    </li>

                    <li>
                        <FormControlLabel
                            label="Valable aussi pour le retour ?"
                            labelPlacement="start"
                            control={
                                <Switch inputRef={ar} />
                            }
                        />
                    </li>

                    <li>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            loading={apprentissage_en_cours}
                        >
                            Enregistrer
                        </LoadingButton>
                    </li>
                </ul>
            </form>
        </div >;


    return (
        <div>
            <h1>Contribuer à OsmVélo ! </h1>

            {
                props.toutes_les_étapes.length > 2
                    ? formContribuer()
                    : <p> Ajoutez des points de passage pour améliorer l’itinéraire </p>
            }
        </div>
    );

}
