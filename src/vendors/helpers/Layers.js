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
import { XYZ, TileWMS, Vector as VectorSource, VectorTile as VectorTileSource, TileArcGISRest, ImageArcGISRest } from 'ol/source';
import { PMTilesVectorSource, PMTilesRasterSource } from "ol-pmtiles";
import GeoTIFF from 'ol/source/GeoTIFF.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import WebGLTile from "ol/layer/WebGLTile";
import MVT from 'ol/format/MVT';
import GeoJSON from 'ol/format/GeoJSON';
import { geoJsonStyleFunction } from './Styles'
import { applyBackground, applyStyle } from 'ol-mapbox-style';
import UndoRedo from 'ol-ext/interaction/UndoRedo'
import EsriPBF from "./EsriPBF.js";
import EsriJSON from 'ol/format/EsriJSON.js';
import { createStyleFunctionFromUrl } from 'ol-esri-styles';
import { transformExtent } from 'ol/proj';
import { getIntersection, intersects } from 'ol/extent';
import proj4 from 'proj4'
import { register } from 'ol/proj/proj4'
import { bbox } from 'ol/loadingstrategy';


//Create projection transformations 
proj4.defs("EPSG:28992", "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs");
register(proj4)

/**
 * Finds a layer in the given map by name.
 * 
 * @param {ol.Map} map - The map to search for the layer.
 * @param {string} name - The name of the layer to find.
 * @returns {ol.layer.Base|null} The layer with the given name, or null if not found.
 */
export function findLayer(map, name) {
  if (!map) return null
  const layers = map.getLayers().getArray();
  for (var i = 0; i < layers.length; i++) {
    const layer = layers[i]
    if (layer.get('name') == name) {
      return layer
    }
  }
  return null
}

/**
 * Finds a layer by name on the given map and sets its features, optionally clearing existing features first.
 * 
 * @param {ol.Map} map The OpenLayers map instance
 * @param {Object|Array} data The GeoJSON feature(s) to add to the layer 
 * @param {string} name The name of the layer to update 
 * @param {boolean} clear Whether to clear existing features before adding new ones
 * @returns {boolean} True if the layer was found and updated, false otherwise
*/
export function setFeatures(map, name, data, clear) {
  const layer = findLayer(map, name);
  if (layer) {
    const source = layer.getSource()
    const reader = (source.getFormat ? source.getFormat() : null) || new GeoJSON({
      dataProjection: source.get('projection') || 'EPSG:4326', // Assuming the GeoJSON is in WGS 84,
      featureProjection: map.getView().getProjection() || 'EPSG:3857' // Assuming the map projection
    })

    //Check if there is a undo stack connected to this source, if so clear and disable
    var undos = []
    //Disable all undo stacks
    map.getInteractions().forEach((c) => {
      if (c instanceof UndoRedo && c.getActive() && c._layers.includes(layer)) {
        undos.push(c)
        c.blockStart("set")
      }
    })

    //Check if we should clear te source
    if (clear) {
      source.clear()
      undos.forEach((c) => { c.clear() })
    }

    if (reader && data) {
      //Now add the features based on types
      if (Array.isArray(data)) {
        data.forEach((rec) => {
          if (source.setFeatures) {
            source.setFeatures(reader.readFeatures(rec))
          } else {
            source.addFeatures(reader.readFeatures(rec))
          }
        })
      } else {
        if (source.setFeatures) {
          source.setFeatures(reader.readFeatures(data))
        } else {
          source.addFeatures(reader.readFeatures(data))
        }
      }
    }
    //Enable the undo stack
    undos.forEach((c) => {
      c.blockEnd()
    })
    //Enable the connected undo check
  }
}


/**
 * Gets the features from the layer with the given name.
 * Returns the features as a GeoJSON object if the layer is found, 
 * otherwise returns false.
*/
export async function getFeatures(map, name) {
  const layer = findLayer(map, name);
  if (layer) {
    const source = layer.getSource()
    //Check if there is a undo stack connected to this source, if so clear and disable
    return new GeoJSON({
      dataProjection: source.get('projection') || 'EPSG:4326',
      featureProjection: map.getView().getProjection() || 'EPSG:3857'
    }).writeFeaturesObject(source.getFeatures())
  }
  throw new Error('Layer ' + name + ' not found')
}


/**
 * Clears all features from the layer with the given name.
 * @param {ol.Map} map OpenLayers map instance
 * @param {string} name Name of the layer to clear
 * @returns {boolean} True if layer was found and cleared, false otherwise
 */
export function clearFeatures(map, name) {
  return setFeatures(map, name, null, true)
}

/**
 * Parses a filter value, ensuring it is an array.
 * 
 * Accepts a filter value which may be an array, stringified array, 
 * or scalar value. Always returns an array, defaulting to ['layers'].
 * Handles invalid JSON strings by falling back to the default.
*/
export const parseFilter = function (data, defFilter = ['layers']) {
  var filter = data || defFilter
  if (!Array.isArray(filter)) {
    try {
      filter = JSON.parse("[" + filter + "]")
    } catch (e) {
      try {
        filter = JSON.parse('["' + filter + '"]')
      } catch (ee) {
        filter = defFilter
      }
    }
  }
  return filter
}

function generateHash(input) {
  let hash = 0, i, chr;
  for (i = 0; i < input.length; i++) {
    chr = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return "CUSTOM_EPSG_" + hash.toString();
}

const _maxExtent = [-Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];

export function arcgisLoader(map, layerConfig, dataType) {
  var _extent = layerConfig.bbox ?
    transformExtent(layerConfig.bbox, 'EPSG:4326', map.getView().getProjection()) :
    _maxExtent
  var isLoading = false

  if (!layerConfig.bbox && layerConfig.source?.url) {
    isLoading = true;
    fetch(layerConfig.source.url + '/?f=pjson')
      .then(response => response.json())
      .then((json) => {
        let extent = json.extent || json.initialExtent || json.fullExtent;
        if (extent) {
          _extent = [extent.xmin, extent.ymin, extent.xmax, extent.ymax];
          let epsg = layerConfig.source?.projection || 'EPSG:4326';
          if (extent.spatialReference && extent.spatialReference.wkt) {
            const wkt = extent.spatialReference.wkt;
            const customEpsgName = "CUSTOM_" + generateHash(wkt);
            if (!proj4.defs(customEpsgName)) {
              proj4.defs(customEpsgName, wkt);
              register(proj4);
            }
            epsg = customEpsgName;
          } else if (extent.spatialReference && extent.spatialReference.wkid) {
            epsg = 'EPSG:' + extent.spatialReference.wkid;
          }
          try {
            _extent = transformExtent(_extent, epsg, map.getView().getProjection());
          } catch (ex) {
            console.warn("Unable to transform extent using projection ", epsg, ex);
          }
        } else {
          console.warn("No extent information found in the ArcGIS server response.");
        }
      }).finally(() => { isLoading = false });
  }


  return (
    function (extent, resolution, projection) {
      if (!isLoading && intersects(_extent, extent)) {
        const curExtent = getIntersection(_extent, extent);
        const layer = findLayer(map, layerConfig.label)
        // ArcGIS Server only wants the numeric portion of the projection ID.
        const srid = projection.getCode().split(/:(?=\d+$)/).pop();
        switch (dataType) {
          case 'pbf': {
            const url = layerConfig.source.url +
              '/query/?f=pbf&' +
              'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry={' +
              encodeURIComponent(
                '"xmin":' +
                curExtent[0] +
                ',"ymin":' +
                curExtent[1] +
                ',"xmax":' +
                curExtent[2] +
                ',"ymax":' +
                curExtent[3]
              ) +
              '}&geometryType=esriGeometryEnvelope&inSR=' +
              srid +
              '&outFields=*&resultType=tile' +
              '&outSR=' +
              srid
            fetch(url)
              .then(response => response.arrayBuffer())
              .then((response) => {
                layer.getSource().addFeatures(new EsriPBF().readFeatures(response))
              })
          } break;
          default: {
            const url =
              layerConfig.source.url +
              '/query/?f=json&' +
              'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
              encodeURIComponent(
                '{"xmin":' +
                curExtent[0] +
                ',"ymin":' +
                curExtent[1] +
                ',"xmax":' +
                curExtent[2] +
                ',"ymax":' +
                curExtent[3] +
                ',"spatialReference":{"wkid":' +
                srid +
                '}}',
              ) +
              '&geometryType=esriGeometryEnvelope&inSR=' +
              srid +
              '&outFields=*' +
              '&outSR=' +
              srid;
            fetch(url)
              .then(response => response.json())
              .then((response) => {
                layer.getSource().addFeatures(new EsriJSON().readFeatures(response))
              })
          }
        }
      }
    }
  )
}


/**
 * Creates and returns an OpenLayers layer instance for the given layer configuration object.
 * 
 * Supports various layer types like MVT, WMS, WFS, XYZ, GeoJSON etc. and handles creating the 
 * appropriate OpenLayers layer class and source based on the provided layerConfig type.
 * 
 * Returns null if the layer type is not supported.
 * 
 * This is designed to be used as a helper utility for applications using OpenLayers.
 */
export function createLayer(layerConfig, map) {
  if (!layerConfig || !layerConfig.type) {
    return null;
  }

  try {
    switch (layerConfig.type) {
      case 'mvt':
        return new VectorTileLayer({
          name: layerConfig.label,
          title: layerConfig.title || layerConfig.name,
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          visible: layerConfig.visible,
          opacity: layerConfig.opacity,
          selectable: layerConfig.selectable,
          groups: layerConfig.groups,
          extra: layerConfig.extra,
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
          name: layerConfig.label,
          title: layerConfig.title || layerConfig.name,
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          visible: layerConfig.visible,
          opacity: layerConfig.opacity,
          selectable: layerConfig.selectable,
          groups: layerConfig.groups,
          extra: layerConfig.extra,
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
          name: layerConfig.label,
          title: layerConfig.title || layerConfig.name,
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          visible: layerConfig.visible,
          opacity: layerConfig.opacity,
          selectable: layerConfig.selectable,
          groups: layerConfig.groups,
          extra: layerConfig.extra,
          splitscreen: layerConfig.splitscreen,
          displayInLayerSwitcher: layerConfig.userVisible,
          source: new VectorSource({
            format: new GeoJSON(),
            url: layerConfig.source.url,
          }),
        });
      case 'xyz':
        return new TileLayer({
          name: layerConfig.label,
          title: layerConfig.title || layerConfig.name,
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          visible: layerConfig.visible,
          opacity: layerConfig.opacity,
          selectable: layerConfig.selectable,
          groups: layerConfig.groups,
          extra: layerConfig.extra,
          splitscreen: layerConfig.splitscreen,
          displayInLayerSwitcher: layerConfig.userVisible,
          source: new XYZ({
            url: layerConfig.source.url,
          }),
        });
      case 'geojson':
        return new VectorLayer({
          name: layerConfig.label,
          title: layerConfig.title || layerConfig.name,
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          visible: layerConfig.visible,
          opacity: layerConfig.opacity,
          selectable: layerConfig.selectable,
          groups: layerConfig.groups,
          extra: layerConfig.extra,
          splitscreen: layerConfig.splitscreen,
          displayInLayerSwitcher: layerConfig.userVisible,
          source: new VectorSource({
            features: new GeoJSON().readFeatures(
              (layerConfig.source.data && typeof layerConfig.source.data == "string") ?
                layerConfig.source.data :
                JSON.stringify(layerConfig.source.data || {
                  "type": "FeatureCollection",
                  "features": []
                }), {
              // Ensure the features are read with the correct projection
              dataProjection: layerConfig.source.projection || 'EPSG:4326', // Assuming the GeoJSON is in WGS 84
              featureProjection: map.getView().getProjection() || 'EPSG:3857' // Assuming the map projection
            })
          }),
          // Add this line to apply a generic style to the layer
          style: geoJsonStyleFunction
        });

      case 'cog':
        return new TileLayer({
          name: layerConfig.label,
          title: layerConfig.title || layerConfig.name,
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          visible: layerConfig.visible,
          opacity: layerConfig.opacity,
          selectable: layerConfig.selectable,
          groups: layerConfig.groups,
          extra: layerConfig.extra,
          splitscreen: layerConfig.splitscreen,
          displayInLayerSwitcher: layerConfig.userVisible,
          source: new GeoTIFF({
            sources: [
              {
                url: layerConfig.source.url,
                tileSize: layerConfig.source.url || [512, 512],
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
          name: layerConfig.label,
          title: layerConfig.title || layerConfig.name,
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          visible: layerConfig.visible,
          opacity: layerConfig.opacity,
          selectable: layerConfig.selectable,
          groups: layerConfig.groups,
          extra: layerConfig.extra,
          splitscreen: layerConfig.splitscreen,
          displayInLayerSwitcher: layerConfig.userVisible,
          source: new VectorTileSource({
            projection: layerConfig.source?.projection || 'EPSG:3857',
          }),
          // style: layerConfig.source.style, //TODO: Fails
        });
        applyStyle(layer, layerConfig.source?.url, '');
        applyBackground(layer, layerConfig.source?.url);
        return layer;

      case 'arcgis-mapserver':
        if (layerConfig.source.mapServerType === 'tile') {
          return new TileLayer({
            name: layerConfig.label,
            title: layerConfig.title || layerConfig.name,
            minZoom: layerConfig.minZoom,
            maxZoom: layerConfig.maxZoom,
            visible: layerConfig.visible,
            opacity: layerConfig.opacity,
            selectable: layerConfig.selectable,
            groups: layerConfig.groups,
            extra: layerConfig.extra,
            splitscreen: layerConfig.splitscreen,
            displayInLayerSwitcher: layerConfig.userVisible,
            source: new TileArcGISRest({
              url: layerConfig.source?.url,
              params: layerConfig.source.params || {},
              crossOrigin: layerConfig.source.crossOrigin,
            }),
          });
        }
        else if (layerConfig.source.mapServerType === 'image') {
          return new ImageLayer({
            name: layerConfig.label,
            title: layerConfig.title || layerConfig.name,
            minZoom: layerConfig.minZoom,
            maxZoom: layerConfig.maxZoom,
            visible: layerConfig.visible,
            opacity: layerConfig.opacity,
            selectable: layerConfig.selectable,
            groups: layerConfig.groups,
            extra: layerConfig.extra,
            splitscreen: layerConfig.splitscreen,
            displayInLayerSwitcher: layerConfig.userVisible,
            source: new ImageArcGISRest({
              url: layerConfig.source?.url,
              ratio: layerConfig.source.ratio || 1,
              params: layerConfig.source.params || {},
              crossOrigin: layerConfig.source.crossOrigin,
            }),
          });
        }
      case 'pmtiles':
        if (layerConfig.source.pmtilesType === 'raster') {
          return new WebGLTile({
            name: layerConfig.label,
            title: layerConfig.title || layerConfig.name,
            minZoom: layerConfig.minZoom,
            maxZoom: layerConfig.maxZoom,
            visible: layerConfig.visible,
            opacity: layerConfig.opacity,
            selectable: layerConfig.selectable,
            groups: layerConfig.groups,
            extra: layerConfig.extra,
            splitscreen: layerConfig.splitscreen,
            displayInLayerSwitcher: layerConfig.userVisible,
            source: new PMTilesRasterSource({
              url: layerConfig.source?.url,
              tileSize: layerConfig.source?.tileSize,
            })
          });
        }
        else if (layerConfig.source.pmtilesType === 'vector') {
          return new VectorTileLayer({
            declutter: true,
            name: layerConfig.label,
            title: layerConfig.title || layerConfig.name,
            minZoom: layerConfig.minZoom,
            maxZoom: layerConfig.maxZoom,
            visible: layerConfig.visible,
            opacity: layerConfig.opacity,
            selectable: layerConfig.selectable,
            groups: layerConfig.groups,
            extra: layerConfig.extra,
            splitscreen: layerConfig.splitscreen,
            displayInLayerSwitcher: layerConfig.userVisible,
            source: new PMTilesVectorSource({
              url: layerConfig.source?.url,
            })
          });
        }
      case 'arcgis-vector-tiles':
        const esriVectorTiles = new VectorLayer({
          name: layerConfig.label,
          title: layerConfig.title || layerConfig.name,
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          visible: layerConfig.visible,
          opacity: layerConfig.opacity,
          selectable: layerConfig.selectable,
          groups: layerConfig.groups,
          extra: layerConfig.extra,
          splitscreen: layerConfig.splitscreen,
          displayInLayerSwitcher: layerConfig.userVisible,
          source: new VectorSource({
            format: new EsriPBF({ dataProjection: layerConfig.source.projection || 'EPSG:3857' }),
            strategy: bbox,
            loader: arcgisLoader(map, layerConfig, 'pbf')
          }),
        })
        createStyleFunctionFromUrl(layerConfig.source.url, map.getView().getProjection() || 'EPSG:3857').then(styleFunction => {
          esriVectorTiles.setStyle(styleFunction);
        });
        return esriVectorTiles;
      case 'arcgis-feature-service':
        const esriFeatureService = new VectorLayer({
          name: layerConfig.label,
          title: layerConfig.title || layerConfig.name,
          minZoom: layerConfig.minZoom,
          maxZoom: layerConfig.maxZoom,
          visible: layerConfig.visible,
          opacity: layerConfig.opacity,
          selectable: layerConfig.selectable,
          groups: layerConfig.groups,
          extra: layerConfig.extra,
          splitscreen: layerConfig.splitscreen,
          displayInLayerSwitcher: layerConfig.userVisible,
          source: new VectorSource({
            format: new EsriJSON(),
            strategy: bbox,
            loader: arcgisLoader(map, layerConfig, 'json')
          })
        });
        createStyleFunctionFromUrl(layerConfig.source.url, map.getView().getProjection() || 'EPSG:3857').then(styleFunction => {
          esriFeatureService.setStyle(styleFunction);
        });

        return esriFeatureService;


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
  } catch (e) {
    console.error("Failed to create layer", e)
    return null
  }
};

