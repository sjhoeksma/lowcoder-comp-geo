/**
 * Creates a map layer instance for the given layer configuration.
 * 
 * Supports various layer types like MVT, WMS, WFS, XYZ, GeoJSON.
 * Handles creating the appropriate ol layer class and source 
 * based on the provided layerConfig.
 * 
 * Returns null if layer type is not supported.
 */
import { Vector as VectorLayer, VectorTile as VectorTileLayer, Image as ImageLayer } from 'ol/layer';
import { OSM, XYZ, TileWMS, Vector as VectorSource, VectorTile as VectorTileSource, TileArcGISRest, ImageArcGISRest } from 'ol/source';
import GeoTIFF from 'ol/source/GeoTIFF.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import MVT from 'ol/format/MVT';
import GeoJSON from 'ol/format/GeoJSON';
import { geoJsonStyleFunction } from './Styles'
import { applyBackground, applyStyle } from 'ol-mapbox-style';
import { createXYZ } from 'ol/tilegrid.js';

export function createLayer(layerConfig, map) {
  if (!layerConfig || !layerConfig.type) {
    console.warn("Skipping layer due to missing type or configuration:", layerConfig);
    return null;
  }

  switch (layerConfig.type) {
    case 'mvt':
      return new VectorTileLayer({
        name: layerConfig.name,
        title: layerConfig.title || layerConfig.name,
        minZoom: layerConfig.minZoom,
        maxZoom: layerConfig.maxZoom,
        visible: layerConfig.visible,
        opacity: layerConfig.opacity,
        selectable: layerConfig.selectable,
        groups: layerConfig.groups,
        extra: layerConfig.extra,
        order: layerConfig.order,
        splitscreen: layerConfig.splitscreen,
        displayInLayerSwitcher: layerConfig.userVisible,
        source: new VectorTileSource({
          attributions: layerConfig.attributions,
          format: new MVT(),
          url: layerConfig.source.url,
        }),
      });
    case 'wms':
      return new TileLayer({
        name: layerConfig.name,
        title: layerConfig.title || layerConfig.name,
        minZoom: layerConfig.minZoom,
        maxZoom: layerConfig.maxZoom,
        visible: layerConfig.visible,
        opacity: layerConfig.opacity,
        selectable: layerConfig.selectable,
        groups: layerConfig.groups,
        extra: layerConfig.extra,
        order: layerConfig.order,
        splitscreen: layerConfig.splitscreen,
        displayInLayerSwitcher: layerConfig.userVisible,
        source: new TileWMS({
          url: layerConfig.source.url,
          params: layerConfig.source.params,
          serverType: layerConfig.source.serverType,
          crossOrigin: layerConfig.source.crossOrigin,
        }),
      });
    case 'wfs':
      return new VectorLayer({
        name: layerConfig.name,
        title: layerConfig.title || layerConfig.name,
        minZoom: layerConfig.minZoom,
        maxZoom: layerConfig.maxZoom,
        visible: layerConfig.visible,
        opacity: layerConfig.opacity,
        selectable: layerConfig.selectable,
        groups: layerConfig.groups,
        extra: layerConfig.extra,
        order: layerConfig.order,
        splitscreen: layerConfig.splitscreen,
        displayInLayerSwitcher: layerConfig.userVisible,
        source: new VectorSource({
          format: new GeoJSON(),
          url: layerConfig.source.url,
        }),
      });
    case 'xyz':
      return new TileLayer({
        name: layerConfig.name,
        title: layerConfig.title || layerConfig.name,
        minZoom: layerConfig.minZoom,
        maxZoom: layerConfig.maxZoom,
        visible: layerConfig.visible,
        opacity: layerConfig.opacity,
        selectable: layerConfig.selectable,
        groups: layerConfig.groups,
        extra: layerConfig.extra,
        order: layerConfig.order,
        splitscreen: layerConfig.splitscreen,
        displayInLayerSwitcher: layerConfig.userVisible,
        source: new XYZ({
          url: layerConfig.source.url,
        }),
      });
    case 'geojson':
      return new VectorLayer({
        name: layerConfig.name,
        title: layerConfig.title || layerConfig.name,
        minZoom: layerConfig.minZoom,
        maxZoom: layerConfig.maxZoom,
        visible: layerConfig.visible,
        opacity: layerConfig.opacity,
        selectable: layerConfig.selectable,
        groups: layerConfig.groups,
        extra: layerConfig.extra,
        order: layerConfig.order,
        splitscreen: layerConfig.splitscreen,
        displayInLayerSwitcher: layerConfig.userVisible,
        source: new VectorSource({
          features: new GeoJSON().readFeatures(layerConfig.source.data, {
            // Ensure the features are read with the correct projection
            dataProjection: layerConfig.source.projection || 'EPSG:4326', // Assuming the GeoJSON is in WGS 84
            featureProjection: map.getView().getProjection() || 'EPSG:3857' // Assuming the map projection
          }),
        }),
        // Add this line to apply a generic style to the layer
        style: geoJsonStyleFunction
      });

    case 'cog':
      return new TileLayer({
        name: layerConfig.name,
        title: layerConfig.title || layerConfig.name,
        minZoom: layerConfig.minZoom,
        maxZoom: layerConfig.maxZoom,
        visible: layerConfig.visible,
        opacity: layerConfig.opacity,
        selectable: layerConfig.selectable,
        groups: layerConfig.groups,
        extra: layerConfig.extra,
        order: layerConfig.order,
        splitscreen: layerConfig.splitscreen,
        displayInLayerSwitcher: layerConfig.userVisible,
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
          projection: layerConfig.source.projection || 'EPSG:4326',
        }),
      });

    case 'stylegl':
      const layer = new VectorTileLayer({
        declutter: true,
        name: layerConfig.name,
        title: layerConfig.title || layerConfig.name,
        minZoom: layerConfig.minZoom,
        maxZoom: layerConfig.maxZoom,
        visible: layerConfig.visible,
        opacity: layerConfig.opacity,
        selectable: layerConfig.selectable,
        groups: layerConfig.groups,
        extra: layerConfig.extra,
        order: layerConfig.order,
        splitscreen: layerConfig.splitscreen,
        displayInLayerSwitcher: layerConfig.userVisible,
        source: new VectorTileSource({
          projection: layerConfig.source?.projection || 'EPSG:3857',
        }),
        style: layerConfig.source.style,
      });
      applyStyle(layer, layerConfig.source?.url, '');
      applyBackground(layer, layerConfig.source?.url);

      return layer;
    case 'arcgis-mapserver-tile':
      return new TileLayer({
        name: layerConfig.name,
        title: layerConfig.title || layerConfig.name,
        minZoom: layerConfig.minZoom,
        maxZoom: layerConfig.maxZoom,
        visible: layerConfig.visible,
        opacity: layerConfig.opacity,
        selectable: layerConfig.selectable,
        groups: layerConfig.groups,
        extra: layerConfig.extra,
        order: layerConfig.order,
        splitscreen: layerConfig.splitscreen,
        displayInLayerSwitcher: layerConfig.userVisible,
        source: new TileArcGISRest({
          url: layerConfig.source?.url,
          params: layerConfig.source.params || {},
          crossOrigin: layerConfig.source.crossOrigin,
        }),
      });
    case 'arcgis-mapserver-image':
      return new ImageLayer({
        name: layerConfig.name,
        title: layerConfig.title || layerConfig.name,
        minZoom: layerConfig.minZoom,
        maxZoom: layerConfig.maxZoom,
        visible: layerConfig.visible,
        opacity: layerConfig.opacity,
        selectable: layerConfig.selectable,
        groups: layerConfig.groups,
        extra: layerConfig.extra,
        order: layerConfig.order,
        splitscreen: layerConfig.splitscreen,
        displayInLayerSwitcher: layerConfig.userVisible,
        source: new ImageArcGISRest({
          url: layerConfig.source?.url,
          ratio: layerConfig.source.ratio || 1,
          params: layerConfig.source.params || {},
          crossOrigin: layerConfig.source.crossOrigin,
        }),
      });

    /* History ? 
    new ol.layer.Geoportail({ 
      name: '1970',
      title: '1965-1980',
      key: 'orthohisto',
      layer: 'ORTHOIMAGERY.ORTHOPHOTOS.1965-1980' 
    }),
    */

    default:
      //Error will cause issue within lowcoder. So just use log
      console.error(`Unsupported layer type: ${layerConfig.type}`);
      return null
  }
};

export function findLayer(map, name) {
  const layers = map.getLayers().getArray();
  for (var i = 0; i < layers.length; i++) {
    const layer = layers[i]
    if (layer.get('name') == name) {
      return layer
    }
  }
  return null
}

export function addFeatures(map, data, name, clear) {
  const layer = findLayer(map, name);
  if (layer) {
    const source = layer.getSource()
    //Check if there is a undo stack connected to this source, if so clear and disable

    //Check if we should clear te source
    if (params[2] == true) source.clear()
    const reader = layer.getFormat || new GeoJSON()
    if (reader && data) {
      //Now add the features based on types
      if (Array.isArray(params[0])) {
        data.forEach((rec) => {
          source.addFeature(reader.readFeature(rec))
        })
      } else {
        source.addFeature(reader.readFeature(data))
      }
    }
    //Enable the connected undo check
    return true//Exit, work is done
  }
  return false
}

//Read feature of map
export function readFeatures(map, name) {
  const layer = findLayer(map, name);
  if (layer) {
    const source = layer.getSource()
    //Check if there is a undo stack connected to this source, if so clear and disable
    return new GeoJSON().writeFeaturesObject(source.getFeatures())
  }
  return false
}

//Clear feature of map
export function clearFeatures(map, name) {
  const layer = findLayer(map, name);
  if (layer) {
    layer.getSource().clear()
    return true
  }
  return false
}