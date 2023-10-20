

// Pour enregistrer une contribution
// Choisir les pourcentage_détour pertinents
// envoyer les étapes

// Besoin de :
//    les étapes
//    la zone

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { URL_API } from "../../params";
import { Lieu } from "../../classes/lieux";
import Button from "@mui/material/Button";
import { Checkbox, FormControlLabel, Switch } from "@mui/material";
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
        explication: "Un trajet « intermédiaire » est rallongé en moyenne de 10% pour éviter les passages désagréables. Il ira jusqu’à 20% de détour si cela permet de remplacer un trajet entièrement sans aménagement par un trajet entièrement sur une vraie piste cyclable séparée des voitures."
    },
    {
        pourcentage_détour: 40,
        label: "Priorité confort",
        explication: "Un trajet « priorité confort » est rallongé en moyenne de 15% pour éviter les passages désagréables. Il ira jusqu’à 40% de détour si cela permet de remplacer un trajet entièrement sans aménagement par un trajet entièrement sur une vraie piste cyclable sépasée des voitures."
    },
]


export default function FormContribuer(props: PropsContribuer) {

    const [pd_selectionnés, setPdSelectionnés] = useState(new Map(pd_défaut.map(pd => [pd.pourcentage_détour, false])));
    const ar = useRef();

    async function envoieForm(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
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
                    "AR": ar.current.value,
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            }
        )
            .then(res => res.json())
            .then(res => console.log(res));

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
            <FormControlLabel
                control={
                    <Checkbox
                        checked={pd_selectionnés.get(pd.pourcentage_détour)}
                        onChange={fonctionChangePdSelectionné(pd.pourcentage_détour)}
                    />
                }
                label={pd.label}
                key={pd.pourcentage_détour}
            />

        )
    }


    return (
        <div>
            <h1>Enregistrer ma contribution </h1>

            <p> Si les points de passage indiqués vous semblent pertinent pour aller de {props.toutes_les_étapes[0].nom} à {props.toutes_les_étapes[props.toutes_les_étapes.length - 1].nom}, entraînez l’IA :</p>
            <form onSubmit={envoieForm}>

                <FormGroup>
                    {pd_défaut.flatMap(pd => pd.pourcentage_détour !== 0 ? [checkboxOfPd(pd)] : [])}
                </FormGroup>

                <FormControlLabel label="Valable aussi pour le retour ?" control={
                    <Switch inputRef={ar} />
                } />

                <Button type="submit" variant="contained">Enregistrer </Button>

            </form>
        </div>
    );

}
