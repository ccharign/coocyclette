import { URL_API } from "../../params";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField"
import {  useContext, useMemo, useState } from "react";
import { CircularProgress, debounce } from "@mui/material";
import { LieuJson } from "../../classes/types";
import React from "react";
import {  Étape } from "../../classes/lieux";
import { ÉtapeClic } from "../../classes/ÉtapeClic";
import { contexte_iti } from "../contextes/page-itinéraire";


/* Champ de recherche lieu/adresse qui va chercher les options sur le serveur */



const URL_COMPLÉTION = URL_API + "completion";



type autocomplèteProps = {
    label: string;
    placeHolder: string;
    étape: Étape | null,
    étapes_clic: ÉtapeClic[],
    setÉtapesClic: React.Dispatch<React.SetStateAction<ÉtapeClic[]>>,
    //setÉtape: React.Dispatch<React.SetStateAction<Étape | undefined>>,
    setDonnéesModifiées: React.Dispatch<React.SetStateAction<boolean>>,
    onChange: (val: LieuJson | null) => void,
}

const l_min = 3;



export default function AutoComplèteDistant(props: autocomplèteProps) {

    const { zone } = useContext(contexte_iti);
    const [charge_options, setChargeOptions] = useState(false);  // Indique si chargement en cours
    const [options, setOptions] = useState<LieuJson[]>([]);
    const [value, setValue] = useState<LieuJson | null>(null);
    const [inputValue, setInputValue] = useState("");


    function urlRecherche(cherché: string): URL {
        const url = new URL(URL_COMPLÉTION);
        url.searchParams.append("term", cherché);
        url.searchParams.append("zone", zone);
        return url;
    }


    async function getLieux(cherché: string): Promise<LieuJson[]> {
        return (await fetch(urlRecherche(cherché))).json();
    }


    const getOptions = useMemo(() => debounce(
        async (value: string) => {
            setInputValue(value);
            if (value.length >= l_min) {
                setChargeOptions(true);
                const res = await getLieux(value);
                setChargeOptions(false);
                setOptions(res);
            } else {
                setOptions([]);
            }
        },
        600
    ),
        [zone]
    );







    return (
        <Autocomplete
            getOptionLabel={(option) => option.nom}
            options={options}
            filterOptions={(x) => x}
            value={value}
            onChange={
                (_e, val) => {
                    setValue(val);
                    props.onChange(val);
                }
            }
            inputValue={inputValue}
            isOptionEqualToValue={(option, value) => option.nom === value.nom && option.pk === value.pk}

            onInputChange={(_e, val) => {
                setInputValue(val);
                getOptions(val);
            }}
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
