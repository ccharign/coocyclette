
import { SingleValue } from "react-select";
import { URL_API } from "../../params"

import AsyncSelect from 'react-select/async';


type PropsChoixZone = {
    setZone: React.Dispatch<React.SetStateAction<string>>;
}

type OptionDuSelect = {
    label: string,
    value: string,
}

export default function ChoixZone(props: PropsChoixZone) {

    function chargePossibilités(_inputValue: string, callback: (options: OptionDuSelect[]) => void) {

        // callback est la fonction qui va enregistrer les choix possibles
        fetch(URL_API + "zones")
            .then(res => res.json())
            .then(res => {
                console.log(res);
                callback(res);
            });

    }

    function sélectionneZone(newValue: SingleValue<OptionDuSelect>) {

        if (newValue !== null) {

            const zone = newValue.value;

            // On demande au serveur de charger la zone
            const url = URL_API + "charge-zone/" + zone;
            fetch(url)
                .then(res => res.text())
                .then(texte => console.log("Zone chargée :", texte));

            // Et on enregistre la zone selectionnée
            props.setZone(zone);
        }
    }

    return (
        <AsyncSelect
            cacheOptions loadOptions={chargePossibilités} defaultOptions
            onChange={sélectionneZone}
        />)

}
