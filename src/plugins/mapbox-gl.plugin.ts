// create a plugin to set access token from variable to mapbox-gl
import mapboxgl from 'mapbox-gl'

export default {
    install() {
        mapboxgl.accessToken = import.meta.env.MAPBOX_ACCESS_TOKEN
    }
}
