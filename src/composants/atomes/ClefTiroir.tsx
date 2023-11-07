import Button from "@mui/material/Button"
import { Nav } from "react-bootstrap"
import { tTiroir, tTiroirOuvert, tClefTiroir } from "../../classes/types"
import Drawer from "@mui/material/Drawer"

/* Un élément d’un Nav qui a pour but de faire sortir ou rentrer un tiroir et le tiroir lui-même */

type propsClefTiroir = {
    tiroir: tTiroir,
    setTiroirOuvert: React.Dispatch<React.SetStateAction<tTiroirOuvert>>,
    tiroir_ouvert: Map<tClefTiroir, boolean>,
}





export default function Tiroir({ tiroir, setTiroirOuvert, tiroir_ouvert }: propsClefTiroir) {

    function toggleTiroir(clef: tClefTiroir) {
        return () =>
            setTiroirOuvert(
                prev => new Map(prev.set(clef, !prev.get(clef)))
            )
    }



    return (
        <>
            <Nav.Item>
                <Button onClick={toggleTiroir(tiroir.clef)}>
                    {tiroir.nom}
                </Button>
            </Nav.Item>

            <Drawer
                anchor={tiroir.ancre}
                open={tiroir_ouvert.get(tiroir.clef)}
                onClose={toggleTiroir(tiroir.clef)}
            >
                {tiroir.nom}
            </Drawer>
        </>
    )
}
