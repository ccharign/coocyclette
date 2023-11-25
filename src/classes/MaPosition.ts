import { positionVersLatlng } from "../fonctions/pour_leaflet";
import Lieu from "./Lieu";


export default class MaPosition extends Lieu {

    constructor(carte: L.Map) {
        super([[0, 0]], "Ma position", carte);
        navigator.geolocation.getCurrentPosition(
            position => {
                this.setLatlng(positionVersLatlng(position));
                this.leaflet_layer.addTo(this.carte);
            }
        );
    }
}
