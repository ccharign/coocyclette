import { tTiroir, tClefTiroir } from "../../classes/types";

/* Un élément d’un Nav qui a pour but de faire sortir ou rentrer un tiroir et le tiroir lui-même */
export type propsClefTiroir = {
    tiroir: tTiroir;
    clef: tClefTiroir;
    //setTiroirOuvert: React.Dispatch<React.SetStateAction<tTiroirOuvert>>,
    toggleTiroir: (clef: tClefTiroir) => (() => void);
    tiroir_ouvert: Map<tClefTiroir, boolean>;
    contenu: React.ReactNode;
    variant: DrawerProps.variant;
};
