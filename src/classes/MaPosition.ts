import { positionVersLatlng } from "../fonctions/pour_leaflet";
import Lieu from "./Lieu";


export default class MaPosition extends Lieu {

    constructor(carte: L.Map) {
        super([[0, 0]], "Ma position", carte);
        navigator.geolocation.getCurrentPosition(
            position => {
                (this.leaflet_layer as L.Marker).setLatLng(positionVersLatlng(position))
                    .addTo(this.carte);
            }
        );
    }
}
