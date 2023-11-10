import Button from "@mui/material/Button"
import { Nav } from "react-bootstrap"
import { tTiroir, tClefTiroir } from "../../classes/types"
import Drawer from "@mui/material/Drawer"
import { Divider, IconButton } from "@mui/material"
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';


/* Un élément d’un Nav qui a pour but de faire sortir ou rentrer un tiroir et le tiroir lui-même */

type propsClefTiroir = {
    tiroir: tTiroir,
    clef: tClefTiroir,
    //setTiroirOuvert: React.Dispatch<React.SetStateAction<tTiroirOuvert>>,
    toggleTiroir: (clef: tClefTiroir) => (() => void),
    tiroir_ouvert: Map<tClefTiroir, boolean>,
    contenu: React.ReactNode,
}





export default function Tiroir({ tiroir, clef, toggleTiroir, tiroir_ouvert }: propsClefTiroir) {

    function bouton_fermer() {
        function icone(): React.ReactNode {
            switch (tiroir.ancre) {
                case "left": return <ChevronLeftIcon />;
                case "right": return <ChevronRightIcon />;
                default: return "^";
            }
        }
        return (
            <IconButton onClick={toggleTiroir(clef)}>
                {icone()}
            </IconButton>
        )

    }



    return (
        <>
            <Nav.Item>
                <Button onClick={toggleTiroir(clef)}>
                    {tiroir.nom}
                </Button>
            </Nav.Item>

            <Drawer
                anchor={tiroir.ancre}
                open={tiroir_ouvert.get(clef)}
                onClose={toggleTiroir(clef)}
                variant="persistent"
            >

                {bouton_fermer()}
                <Divider />
                {tiroir.contenu}
            </Drawer>
        </>
    )
}
