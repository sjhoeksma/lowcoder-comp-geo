import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer, VectorTile as VectorTileLayer } from 'ol/layer';
import { OSM, XYZ, TileWMS, Vector as VectorSource, VectorTile as VectorTileSource } from 'ol/source';
import MVT from 'ol/format/MVT';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import { Control, defaults as defaultControls } from 'ol/control';
// import { applyStyle } from 'ol-mapbox-style';

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


const Geo = ({ center, zoom, mapOptions, maxZoom, rotation }) => {
  const mapElementRef = useRef();
  const [map, setMap] = useState(null);

  const createLayer = (layerConfig) => {
    switch (layerConfig.type) {
      case 'mvt':
        return new VectorTileLayer({
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
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
          source: new TileWMS({
            url: layerConfig.source.url,
            params: layerConfig.source.params,
          }),
        });
      case 'wfs':
        return new VectorLayer({
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          source: new VectorSource({
            format: new GeoJSON(),
            url: layerConfig.source.url,
          }),
        });
      case 'xyz':
        return new TileLayer({
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          source: new XYZ({
            url: layerConfig.source.url,
          }),
        });
      case 'geojson':
        return new VectorLayer({
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          source: new VectorSource({
            features: new GeoJSON().readFeatures(layerConfig.source.data),
          }),
        });
      case 'stylegl':
        // Example: return applyStyle(new VectorTileLayer({ declutter: true }), layerConfig.source.styleURL);
        break;
      default:
        throw new Error(`Unsupported layer type: ${layerConfig.type}`);
    }
  };

  useEffect(() => {
    if (!map && mapElementRef.current) {
      // Sort layers based on the 'order' property before creating them
      const sortedLayers = mapOptions.layers
        .sort((a, b) => a.order - b.order)
        .map(createLayer)
        .filter(layer => layer !== undefined);

      const olMap = new Map({
        target: mapElementRef.current,
        layers: sortedLayers, // Use the sorted array of layers
        view: new View({
          center: fromLonLat(center),
          zoom: zoom,
          maxZoom: maxZoom,
          rotation: rotation,
        }),
        controls: defaultControls().extend([new RotateNorthControl()]),
      });

      setMap(olMap);
    }
  }, [map, mapOptions, center, zoom, maxZoom, rotation]); // Initial setup effect



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
    }
  }, [zoom, map]);

  // Effect to update rotation
  useEffect(() => {
    if (map) {
      map.getView().setRotation(rotation);
    }
  }, [rotation, map]);

  // Placeholder for pitch handling (Openlayer 2D not pitch for now)
  // useEffect(() => {
  //   if (map && pitch is supported) {
  //     // Update map view or camera to adjust pitch
  //   }
  // }, [pitch, map]);

  // Dynamic layer updating
  useEffect(() => {
    if (map) {
      // Remove all current layers from the map
      map.getLayers().clear();

      // Sort layers by their 'order' property and add them back
      const sortedLayers = mapOptions.layers
        .sort((a, b) => a.order - b.order)
        .map(createLayer)
        .filter(layer => layer !== undefined);

      sortedLayers.forEach(layer => {
        map.addLayer(layer);
      });
    }
  }, [map, mapOptions.layers]); // Listen for changes in mapOptions.layers

  return <div ref={mapElementRef} style={{ height: '100%', width: '100%' }} />;
};

Geo.propTypes = {
  mapOptions: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
  zoom: PropTypes.number.isRequired,
  maxZoom: PropTypes.number,
  rotation: PropTypes.number,
  geoJson: PropTypes.object,
  showLogo: PropTypes.bool,
  onDataChange: PropTypes.func,
  onLoadEnd: PropTypes.func,
  onClick: PropTypes.func.isRequired,
  onZoom: PropTypes.func.isRequired,
  skipRedraw: PropTypes.func.isRequired,
  pitch: PropTypes.number,
}

export default Geo;
