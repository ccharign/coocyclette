import Button from "@mui/material/Button"
import { Nav } from "react-bootstrap"
import { tTiroir, tZoneAffichage, VariantDrawer } from "../../classes/types"
import Drawer from "@mui/material/Drawer"
import { Divider, IconButton } from "@mui/material"
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

/* Un élément d’un Nav qui a pour but de faire sortir ou rentrer un tiroir et le tiroir lui-même */



type propsClefTiroir = {
    tiroir: tTiroir,
    clef: tZoneAffichage,
    //setTiroirOuvert: React.Dispatch<React.SetStateAction<tTiroirOuvert>>,
    toggleTiroir: (clef: tZoneAffichage) => (() => void),
    tiroir_ouvert: Map<tZoneAffichage, boolean>,
    contenu: React.ReactNode,
    variant?: VariantDrawer,
}





export default function Tiroir({ tiroir, clef, toggleTiroir, tiroir_ouvert }: propsClefTiroir) {

    function bouton_fermer() {
        function icone(): React.ReactNode {
            switch (tiroir.ancre) {
                case "left": return <KeyboardDoubleArrowLeftIcon />;
                case "right": return <KeyboardDoubleArrowRightIcon />;
                default: return null;
            }
        }
        return (
            <IconButton
                onClick={toggleTiroir(clef)}
            >
                {icone()}
            </IconButton>
        )

    }



    return (
        <>
            <Nav.Item>
                <Button
                    onClick={toggleTiroir(clef)}
                    disabled={!tiroir.contenu}
                >
                    {(tiroir.ancre === "left" && tiroir_ouvert.get(clef) || tiroir.ancre === "right" && !tiroir_ouvert.get(clef))
                        ? <KeyboardDoubleArrowLeftIcon />
                        : <KeyboardDoubleArrowRightIcon />
                    }
                    {tiroir.nom}
                </Button>
            </Nav.Item>

            <Drawer
                anchor={tiroir.ancre}
                open={tiroir_ouvert.get(clef)}
                onClose={toggleTiroir(clef)}
                variant={"persistent"}
            >

                {bouton_fermer()}
                <Divider />
                {tiroir.contenu}
            </Drawer>
        </>
    )
}
