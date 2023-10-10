
import { URL_API } from "../../params"

import AsyncSelect from 'react-select/async';

export default function ChoixZone() {

    function chargePossibilités(_inputValue: string, callback: (options: string[]) => void) {
        // callback est la fonction qui va enregistrer les choix possibles
        fetch(URL_API + "zones")
            .then(res => res.json())
            .then(res => {
                console.log(res);
                callback(res);
            });
    }



    return (
        <AsyncSelect
            cacheOptions loadOptions={chargePossibilités} defaultOptions
        />)
    
}
