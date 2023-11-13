import { ÉtapeGtl } from "../classes/types-lieux";
import { Étapes } from "../hooks/useÉtapes";

// Recopie les éléments non triviaux de source dans cible
export function recopieTab(cible: any[], source: any[]) {
    cible.length = 0;
    source.forEach(
        elem => elem && cible.push(elem)
    )
}


export function contribuerPossible(étapes: Étapes): boolean {
    return étapes.toutes_les_étapes().every(é => !(é instanceof ÉtapeGtl))
}
