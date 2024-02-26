<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl'
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string
</script>

<script lang="ts">
export default {
  props: {
    markerList: {
      type: Array as () => { lat: number; lng: number }[],
      required: true
    }
  },
  data() {
    return {
      map: null as mapboxgl.Map | null
    }
  },
  mounted() {
    this.$refreshMap()
  },
  unmounted() {
    if (this.map) {
      this.map.remove()
    }
    this.map = null
  },
  watch: {
    markerList(oldVal, newVal) {
      this.$refreshMap()
    }
  },
  methods: {
    $refreshMap() {
      if (this.map) {
        this.map.remove()
      }
      // create a popup
      this.map = null
      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer as any,
        style: 'mapbox://styles/mapbox/streets-v12', // Replace with your preferred map style
        center: [106.6987837280315, 10.811559793795999],
        zoom: 11.5
      })
      this.map.on('load', () => {
        this.markerList.forEach((marker, index) => {
          const marlerEl = new mapboxgl.Marker()
            .setLngLat([marker.lng, marker.lat])
            .addTo(this.map as mapboxgl.Map)

          const el = marlerEl.getElement()
          el.addEventListener('click', () => {
            this.$emit('marker-clicked', { marker, index })
          })
        })
      })
    }
  }
}
</script>

<style>
.map-container {
  height: 100%;
  width: 100%;
}
</style>
