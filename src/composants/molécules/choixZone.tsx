import { URL_API } from "../../params"
import { Autocomplete, AutocompleteChangeReason, CircularProgress, TextField } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";


type PropsChoixZone = {
    setZone: React.Dispatch<React.SetStateAction<string>>,
    zone: string,
}

type resDuGet = string;/* {
    label: string,
    value: string,
} */

export default function ChoixZone(props: PropsChoixZone) {

    const [options, setOptions] = useState<string[]>([]);
    const [chargeListeZones, setChargeListeZones] = useState(false);
    const [zoneChargée, setZoneChargée] = useState(false);
    const [entrée, setEntrée] = useState(props.zone);


    function sélectionneZone(_event: React.SyntheticEvent<Element, Event>, value: string | null, _reason: AutocompleteChangeReason) {
        setZoneChargée(false);
        if (value) {

            //const zone = value;

            // On demande au serveur de charger la zone
            const url = URL_API + "charge-zone/" + value;
            fetch(url)
                .then(res => res.text())
                .then(_texte => setZoneChargée(true));

            // Et on enregistre la zone selectionnée
            props.setZone(value);
        }
    }

    // Initialise la liste des zones dispo
    useEffect(
        () => {
            console.log("Je charge la liste des zones");
            setChargeListeZones(true);
            fetch(URL_API + "init")
                .then(res => res.json())
                .then(res => {
                    console.log("Liste des zones obtenue");

                    setOptions(
                        res.zones
                            //.map((z: resDuGet) => z.value)
                            .concat("")
                    );
                    setChargeListeZones(false);
                });
        },
        []
    )


    return (
        <Autocomplete
            options={options}
            value={props.zone}
            getOptionLabel={o => o}
            onChange={sélectionneZone}
            inputValue={entrée}
            onInputChange={(_e, val) => setEntrée(val)}
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
                        helperText={zoneChargée ? "Zone chargée" : null}
                    />
                )
            }
        />
    )
}
