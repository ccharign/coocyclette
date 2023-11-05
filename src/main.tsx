import ReactDOM from 'react-dom/client'
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import "leaflet/dist/leaflet.css"
import "./css/pour-leaflet.css"
import "./css/styles.css"
import AutourDeMoi from './pages/autourDeMoi.tsx';
import Itinéraires from './pages/itinéraires.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';


const router = createBrowserRouter([
    {
        path: "/osm-velo-front/",
        element: <Itinéraires />,
    },
    {
        path: "/osm-velo-front/fouine",
        element: <Itinéraires fouine />,
    },
    {
        path: "/osm-velo-front/autourDeMoi",
        element: <AutourDeMoi />,
    },

]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    //<React.StrictMode>
    <RouterProvider router={router} />
    // </React.StrictMode>,
)
