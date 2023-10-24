import { TypeLieu, GroupeTypeLieu } from "../classes/types-lieux";


// 
// # Nom osm des lieux proposés dans le formulaire.
// # TYPE_AMEN_POUR_AUTOUR_DE_MOI = [
// #     "pharmacy", "post_office", "doctors", "bank", "fast_food",
// #     "restaurant", "cafe", "marketplace", "police", "bar", "pub",
// #     "drinking_water", "atm", "water_point", "convenience",
// #     "bakery", "greengrocer", "supermarket", "toilets", "hospital",
// #     "bicycle_rental", "fountain", "hardware", "clothes", "sports",
// #     "laundry", "variety_store", "chemist", "pastry", "outdoor",
// #     "mall", "bureau_de_change",
// #]


const acheter_à_manger = new GroupeTypeLieu("Lieu où acheter à manger", [
    new TypeLieu("supermarché", "supermarket", "shop"),
    new TypeLieu("épicerie", "convenience", "shop"),
    new TypeLieu("primeur", "greengrocer", "shop"),
    new TypeLieu("magasin bio", "organic", "shop"),
    new TypeLieu("boulangerie", "bakery", "shop")
])

const boire = new GroupeTypeLieu("Boire", [
    new TypeLieu("eau potable", "drinking_water", "amenity"),
    new TypeLieu("point d’eau", "water_point", "amenity"),
    new TypeLieu("pub", "pub", "amenity"),
    new TypeLieu("café", "cafe", "amenity"),
    new TypeLieu("bar", "bar", "amenity"),
    new TypeLieu("toilettes", "toilets", "amenity"),
    new TypeLieu("fontaine", "fountain", "amenity"),
])

const manger = new GroupeTypeLieu("Manger", [
    new TypeLieu("restaurant", "restaurant", "amenity"),
    new TypeLieu("fast food", "fast_food", "amenity"),
])

const dormir = new GroupeTypeLieu("Dormir", [
    new TypeLieu("Camping", "camping", "tourism"),
    new TypeLieu("Refuge", "alpine_hut", "tourism"),
    new TypeLieu("Hôtel", "hostel", "tourism"),
])

const utile = new GroupeTypeLieu("Divers", [
    new TypeLieu("Banque", "bank", "amenity"),
    new TypeLieu("Distributeur de billets", "atm", "amenity"),
    new TypeLieu("Toilettes", "toilets", "amenity"),
    new TypeLieu("Boîte aux lettres", "post_box", "amenity"),
    new TypeLieu("Poste", "post_office", "amenity"),
    new TypeLieu("Pharmacie", "pharmacy", "amenity"),
])

export const tous_les_gtls = [acheter_à_manger, boire, manger, dormir, utile,];
