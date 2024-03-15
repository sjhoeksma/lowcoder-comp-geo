import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { Vector as VectorLayer, VectorTile as VectorTileLayer } from 'ol/layer';
import { OSM, XYZ, TileWMS, Vector as VectorSource, VectorTile as VectorTileSource } from 'ol/source';
import GeoTIFF from 'ol/source/GeoTIFF.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import MVT from 'ol/format/MVT';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat, transformExtent } from 'ol/proj';
import { Control, defaults as defaultControls } from 'ol/control';
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';


class RotateNorthControl extends Control {
  constructor(options = {}) {
    const button = document.createElement('button');
    button.innerHTML = 'N';

    const element = document.createElement('div');
    element.className = 'rotate-north ol-unselectable ol-control';
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    button.addEventListener('click', this.handleRotateNorth.bind(this), false);
  }

  handleRotateNorth() {
    this.getMap().getView().setRotation(0);
  }
}


const Geo = ({ center, zoom, onZoom, mapOptions, maxZoom, rotation, onBboxChange }) => {
  const mapElementRef = useRef();
  const [map, setMap] = useState(null);

  const createLayer = (layerConfig) => {
    if (!layerConfig || !layerConfig.type) {
      console.warn("Skipping layer due to missing type or configuration:", layerConfig);
      return null;
    }

    switch (layerConfig.type) {
      case 'mvt':
        return new VectorTileLayer({
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          visible: layerConfig.visible,
          source: new VectorTileSource({
            attributions: layerConfig.attributions,
            format: new MVT(),
            url: layerConfig.source.url,
          }),
        });
      case 'wms':
        return new TileLayer({
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          visible: layerConfig.visible,
          source: new TileWMS({
            url: layerConfig.source.url,
            params: layerConfig.source.params,
            serverType: layerConfig.source.serverType,
            crossOrigin: layerConfig.source.crossOrigin,
          }),
        });
      case 'wfs':
        return new VectorLayer({
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          visible: layerConfig.visible,
          source: new VectorSource({
            format: new GeoJSON(),
            url: layerConfig.source.url,
          }),
        });
      case 'xyz':
        return new TileLayer({
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          visible: layerConfig.visible,
          source: new XYZ({
            url: layerConfig.source.url,
          }),
        });
      case 'geojson':
        return new VectorLayer({
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          visible: layerConfig.visible,
          source: new VectorSource({
            features: new GeoJSON().readFeatures(layerConfig.source.data, {
              // Ensure the features are read with the correct projection
              dataProjection: 'EPSG:4326', // Assuming the GeoJSON is in WGS 84
              featureProjection: 'EPSG:3857' // Assuming the map projection
            }),
          }),
          // Add this line to apply a generic style to the layer
          style: new Style({
            stroke: new Stroke({
              color: 'blue',
              width: 3,
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.1)',
            }),
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({
                color: 'blue',
              }),
            }),
          }),
        });

      case 'cog':
        return new TileLayer({
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          visible: layerConfig.visible,
          source: new GeoTIFF({
            sources: [
              {
                url: layerConfig.source.url,
                tileSize: 512,
                nodata: 0,
              },
            ],
            converToRGB: true,
            interpolate: true,
            normalize: true,
            opaque: true,
            wrapX: false,
            projection: 'EPSG:4326',


          }),
        });

      case 'stylegl':
        // Example: return applyStyle(new VectorTileLayer({ declutter: true }), layerConfig.source.styleURL);
        break;
      default:
        console.error(`Unsupported layer type: ${layerConfig.type}`);
        return null;
    }
  };

  useEffect(() => {
    if (!map && mapElementRef.current) {
      // Sort layers based on the 'order' property before creating them
      const layers = Array.isArray(mapOptions.layers) ? mapOptions.layers : [];
      const validatedLayers = layers.filter(layer => layer !== null && layer !== undefined);

      const sortedLayers = validatedLayers
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(createLayer)
        .filter(layer => layer !== null && layer !== undefined);

      const olMap = new Map({
        target: mapElementRef.current,
        layers: sortedLayers,
        view: new View({
          center: fromLonLat(center),
          zoom: zoom,
          maxZoom: maxZoom || 22,
          rotation: rotation || 0,
        }),
        controls: defaultControls().extend([new RotateNorthControl()]),
      });

      // Click event listener for vector features and WMS GetFeatureInfo
      olMap.on('singleclick', function (evt) {
        let hasFeature = false;

        olMap.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
          // Vector feature click logic
          console.log(feature.getProperties());
          hasFeature = true; // Indicate that a vector feature was clicked
          // Optionally, call onClick or other handlers here
          return true; // Stop iterating through features
        });

        // WMS GetFeatureInfo logic
        if (!hasFeature) { // Only proceed if no vector feature was clicked
          olMap.getLayers().forEach(layer => {
            if (layer instanceof TileLayer && layer.getSource() instanceof TileWMS) {
              const view = olMap.getView();
              const viewResolution = view.getResolution();
              const url = layer.getSource().getFeatureInfoUrl(
                evt.coordinate,
                viewResolution,
                'EPSG:3857',
                { 'INFO_FORMAT': 'text/html' }, // or application/json ?
              );
              if (url) {
                fetch(url)
                  .then(response => response.text())
                  .then(html => {
                    // Display the HTML response in an element, or process JSON as needed
                    console.log(html);
                    // Example: document.getElementById('info').innerHTML = html;
                  });
              }
            }
          });
        }
      });

      // Optional: pointer move logic for changing cursor over WMS layers
      olMap.on('pointermove', function (evt) {
        if (evt.dragging) return;
        const pixel = olMap.getEventPixel(evt.originalEvent);
        const hit = olMap.hasFeatureAtPixel(pixel);
        olMap.getTargetElement().style.cursor = hit ? 'pointer' : '';
      });


      setMap(olMap);
    }
  }, [map, mapOptions, center, zoom, maxZoom, rotation]);



  // Effect to update center
  useEffect(() => {
    if (map) {
      map.getView().setCenter(fromLonLat(center));
    }
  }, [center, map]);

  // Effect to update zoom
  useEffect(() => {
    if (map) {
      map.getView().setZoom(zoom);
      onZoom(zoom);

    }
  }, [zoom, map]);

  // onZoom change get current zoom
  useEffect(() => {
    if (map) {
      const zoom = map.getView().getZoom();
      onZoom(zoom);
    }
  }, [map, onZoom]);

  // Effect to update rotation
  useEffect(() => {
    if (map) {
      map.getView().setRotation(rotation);
    }
  }, [rotation, map]);

  // BBOX change 
  useEffect(() => {
    if (map) {

      const updateBbox = () => {
        const extent = map.getView().calculateExtent(map.getSize()); // Get the current extent
        const transformedExtent = transformExtent(extent, 'EPSG:3857', 'EPSG:4326'); // Transform the extent to WGS 84
        onBboxChange(transformedExtent); // Call the callback with the updated bbox
      };

      map.on('moveend', updateBbox);
      // Cleanup function
      return () => map.un('moveend', updateBbox);
    }
  }, [map, onBboxChange]);

  // Dynamic layer updating
  useEffect(() => {
    if (map) {
      // Validate and create new layers
      const layers = Array.isArray(mapOptions.layers) ? mapOptions.layers : [];
      const validatedLayers = layers.filter(layer => layer !== null && layer !== undefined);

      const sortedLayers = validatedLayers
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(createLayer)
        .filter(layer => layer !== null && layer !== undefined);

      map.getLayers().clear();
      sortedLayers.forEach(layer => map.addLayer(layer));
    }
  }, [map, mapOptions.layers]); // Re-evaluate when layers change

  return <div ref={mapElementRef} style={{ height: '100%', width: '100%' }} />;
};

Geo.propTypes = {
  mapOptions: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
  zoom: PropTypes.number,
  maxZoom: PropTypes.number,
  rotation: PropTypes.number,
  geoJson: PropTypes.object,
  showLogo: PropTypes.bool,
  onDataChange: PropTypes.func,
  onLoadEnd: PropTypes.func,
  onClick: PropTypes.func,
  onZoom: PropTypes.func,
  skipRedraw: PropTypes.func,
  onBboxChange: PropTypes.func,
  currentBbox: PropTypes.object,
}

export default Geo;
