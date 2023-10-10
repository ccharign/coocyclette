import { Lieu } from "../../classes/lieux";
import { Autocomplete } from "@mui/material";


export default function FormItinéraires(){

    // les étapes voulues
    const étapes: Lieu[] = [];

    return(
        <Autocomplete
            freeSolo
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
        />
    )
}
