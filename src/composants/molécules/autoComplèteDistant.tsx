import * as React from "react"
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const URL_API = "https://trajet.pauavelo.fr/";
const URL_COMPLÉTION = URL_API + "ajax/recherche_rue/";

interface Option {
    label: string;
}

type autocomplèteProps = {
    l_min: number;
    nom: string;
    onSelect: React.ReactEventHandler<HTMLDivElement>;
}


export default function AutoComplèteDistant(props: autocomplèteProps) {

    const [options, setOptions] = React.useState<readonly Option[]>([]);


    async function màjOptions(_event: React.SyntheticEvent, value: string, _reason: string) {
        if (value.length>=props.l_min){
            const url = new URL(URL_COMPLÉTION);
            url.searchParams.append("term", value);
            const res_fetch = await fetch(url);
            setOptions(await res_fetch.json());
        }
    }
    
    return (
        <Autocomplete
            freeSolo
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label={props.nom} onSelect={props.onSelect} />}
            options={options}
            onInputChange={màjOptions}
        />

    )
}
