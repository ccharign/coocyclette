import { URL_API } from "../../params";

import Autocomplete, { AutocompleteInputChangeReason, AutocompleteChangeReason } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField"
import { useEffect, useState } from "react";
import { debounce } from "@mui/material";
import { LieuJson } from "../../classes/types";


const URL_COMPLÉTION = URL_API + "completion";



type autocomplèteProps = {
    l_min: number;
    onSelect: ((event: React.SyntheticEvent<Element, Event>, value: LieuJson | null,
        reason: AutocompleteChangeReason,
    ) => void);
    zone: string;
    label: string;
}


export default function AutoComplèteDistant(props: autocomplèteProps) {

    function urlRecherche(cherché: string): URL {
        const url = new URL(URL_COMPLÉTION);
        url.searchParams.append("term", cherché);
        url.searchParams.append("zone", props.zone);
        return url;
    }


    async function getLieux(cherché: string): Promise<LieuJson[]> {
        return (await fetch(urlRecherche(cherché))).json();
    }

    const getOptions = debounce(
        async (_event: React.SyntheticEvent<Element, Event>, value: string, _reason: AutocompleteInputChangeReason) => {
            if (value.length >= props.l_min) {
                const res = await getLieux(value);
                setOptions(res);
            }else{
                setOptions([]);
            }
        },
        300
    )


    const [options, setOptions] = useState<LieuJson[]>([]);


    useEffect(
        () => console.log(options),
        [options]
    );

    return (
        <Autocomplete
            getOptionLabel={(option) => option.nom}
            options={options}
            filterOptions={(x) => x}
            onChange={props.onSelect}
            isOptionEqualToValue={(option, value) => option.nom === value.nom}

            onInputChange={getOptions}
            renderInput={
                (params) => (
                    <TextField
                        {...params}
                        label={props.label}
                    />
                )
            }


        />
    )
}
