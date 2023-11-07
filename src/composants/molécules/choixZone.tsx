import { URL_API } from "../../params"
import { Autocomplete, AutocompleteChangeReason, CircularProgress, TextField } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";


type PropsChoixZone = {
    setZone: React.Dispatch<React.SetStateAction<string>>;
}

type OptionDuSelect = {
    label: string,
    value: string,
}

export default function ChoixZone(props: PropsChoixZone) {

    const [options, setOptions] = useState<OptionDuSelect[]>([]);
    const [chargeListeZones, setChargeListeZones] = useState(false);
    const [zoneChargée, setZoneChargée] = useState(false);


    function sélectionneZone(_event: React.SyntheticEvent<Element, Event>, value: OptionDuSelect | null, _reason: AutocompleteChangeReason) {
        setZoneChargée(false);
        if (value) {

            const zone = value.value;

            // On demande au serveur de charger la zone
            const url = URL_API + "charge-zone/" + zone;
            fetch(url)
                .then(res => res.text())
                .then(_texte => setZoneChargée(true));

            // Et on enregistre la zone selectionnée
            props.setZone(zone);
       }
    }

    useEffect(
        () => {
            console.log("Je charge la liste des zones");
            setChargeListeZones(true);
            fetch(URL_API + "init")
                .then(res => res.json())
                .then(res => {
                    console.log("Liste des zones obtenue");
                    setOptions(res.zones);
                    setChargeListeZones(false);
                });
        },
        []
    )


    return (
        <Autocomplete
            options={options}
            getOptionLabel={o => o.label}
            onChange={sélectionneZone}
            isOptionEqualToValue={(option, value) => (option.label === value.label)}
            renderInput={
                (params) => (
                    <TextField
                        {...params}
                        label="Zone"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {chargeListeZones ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        }}
                        helperText={zoneChargée?"Zone chargée":null}
                    />
                )
            }
        />
    )
}
