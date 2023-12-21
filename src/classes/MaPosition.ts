import { positionVersLatlng } from "../fonctions/pour_leaflet";
import Lieu from "./Lieu";
import { Étapes } from "../hooks/useÉtapes"


export default class MaPosition extends Lieu {

    constructor(carte: L.Map, étapes?: Étapes) {
        super([[0, 0]], "Ma position", carte, étapes);
        navigator.geolocation.getCurrentPosition(
            position => {
                this.setLatlng(positionVersLatlng(position));
                this.leaflet_layer.addTo(this.carte);
            }
        );
    }
}
