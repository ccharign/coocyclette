import { URL_API } from "../../params";

import Autocomplete, { AutocompleteInputChangeReason, AutocompleteChangeReason } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField"
import { useEffect, useState } from "react";
import { CircularProgress, debounce } from "@mui/material";
import { LieuJson } from "../../classes/types";
import React from "react";



/* Champ de recherche lieu/adresse qui va chercher les options sur le serveur */



const URL_COMPLÉTION = URL_API + "completion";



type autocomplèteProps = {
    l_min: number;
    onSelect: ((event: React.SyntheticEvent<Element, Event>, value: LieuJson | null,
        reason: AutocompleteChangeReason,
    ) => void);
    zone: string;
    label: string;
    placeHolder: string;
}


export default function AutoComplèteDistant(props: autocomplèteProps) {

    const [charge_options, setChargeOptions] = useState(false);

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
                setChargeOptions(true);
                const res = await getLieux(value);
                setChargeOptions(false);
                setOptions(res);
            } else {
                setOptions([]);
            }
        },
        600
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
                        placeholder={props.placeHolder}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {charge_options ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        }}
                    />
                )
            }


        />
    )
}
