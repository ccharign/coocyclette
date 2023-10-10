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

const boulangerie = new GroupeTypeLieu("boulangerie", [
    new TypeLieu("boulangerie", "bakery", "shop")
]);

const acheter_à_manger = new GroupeTypeLieu("lieu où acheter à manger", [
	new TypeLieu("supermarché", "supermarket", "shop"),
	new TypeLieu("épicerie", "convenience", "shop"),
	new TypeLieu("primeur", "greengrocer", "shop"),
	new TypeLieu("magasin bio", "organic", "shop"),
])

const boire = new GroupeTypeLieu("lieu où boire", [
	new TypeLieu("eau potable", "drinking_water", "amenity"),
	new TypeLieu("point d’eau", "water_point", "amenity"),
	new TypeLieu("pub", "pub", "amenity"),
	new TypeLieu("café", "cafe", "amenity"),
	new TypeLieu("bar", "bar", "amenity"),
	new TypeLieu("toilettes", "toilets", "amenity"),
	new TypeLieu("fontaine", "fountain", "amenity"),
])

export const tous_les_gtls = [boulangerie, acheter_à_manger, boire];
