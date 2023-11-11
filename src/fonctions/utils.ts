// Recopie les éléments non triviaux de source dans cible
export function recopieTab(cible: any[], source: any[]) {
    cible.length = 0;
    source.forEach(
        elem => elem && cible.push(elem)
    )
}
