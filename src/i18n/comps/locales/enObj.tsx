import { I18nObjects } from "./types";

const defaultMapData = {
  layers: [
    {
      id: "states",
      type: "wms",
      order: 1,
      minZoom: 0,
      maxZoom: 22,
      visible: true,
      source: {
        url: "https://ahocevar.com/geoserver/wms",
        layers: "baseLayer",
        version: "1.3.0",
        params: { LAYERS: "topp:states", TILED: true },
        serverType: "geoserver",
        // crossOrigin: "anonymous",
        transition: 0,
      },
      opacity: 1,
      metadata: {
        title: "Base Map Layer",
        abstract:
          "This is a WMS layer providing the foundational geographical context.",
        source: "GeoSpatial Authority",
        bbox: [-180, -90, 180, 90],
      },
      triggers: [
        {
          event: "onclick",
          action: "showFeatureInfo",
          description: "Show information specific to the clicked feature.",
        },
      ],
    },
    {
      id: "landmarksLayer",
      type: "geojson",
      order: 2,
      minZoom: 0,
      maxZoom: 22,
      visible: true,
      source: {
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                coordinates: [31.419446166364025, 29.9995498402276],
                type: "Point",
              },
            },
          ],
        },
      },
      style: {
        "fill-color": ["string", ["get", "COLOR"], "#eee"],
        styleOptions: {
          background: "#1a2b39",
          color: "#4264fb",
          weight: 2,
          opacity: 0.8,
        },
      },
      metadata: {
        title: "Landmarks",
        abstract: "Layer showing landmarks across the city.",
        source: "City Data Portal",
        bbox: [-122.41, 37.77, -122.4, 37.78],
      },
      triggers: [
        {
          event: "onclick",
          action: "highlightLandmark",
          description: "Highlight and show details of the clicked landmark.",
        },
      ],
    },
    {
      id: "worldBasemapMVT",
      type: "mvt",
      order: 3,
      minZoom: 0,
      maxZoom: 22,
      visible: true,
      source: {
        // url: "https://basemaps.arcgis.com/v1/arcgis/rest/services/World_Basemap/VectorTileServer/tile/{z}/{y}/{x}.pbf",
        url: "https://wms.wheregroup.com/tileserver/tile/world-0-14/{z}/{x}/{y}.pbf",
      },
      style: {
        styleURL: "https://wms.wheregroup.com/tileserver/style/osm-bright.json",
      },
      metadata: {
        title: "World Basemap (Vector Tiles)",
        abstract:
          "Highly detailed world basemap utilizing vector tiles for efficient rendering.",
        source: "ArcGIS Basemaps",
      },
    },
    {
      id: "contoursWFS",
      type: "wfs",
      order: 4,
      minZoom: 0,
      maxZoom: 22,
      visible: true,
      source: {
        url: "https://services.seismofaults.eu/geoserver/EDSF/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=EDSF%3Asubduction_contours&outputFormat=JSON&srsName=urn%3Ax-ogc%3Adef%3Acrs%3AEPSG%3A4326&maxFeatures=1000",
        format: "geojson",
        version: "1.1.0",
      },
      style: {
        "circle-radius": 6,
        "circle-color": "#B42222",
      },
      metadata: {
        title: "Real-time Earthquakes",
        abstract: "Displays real-time earthquake data across the globe.",
        source: "Global Seismology Center",
      },
    },
    {
      id: "historicalMapsXYZ",
      type: "xyz",
      order: 0,
      minZoom: 0,
      maxZoom: 19,
      visible: true,
      source: {
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      },
      metadata: {
        title: "Historical Maps",
        abstract:
          "Overlay of historical maps on top of current geographical features.",
        source: "Mapbox Historical Collection",
      },
    },
    {
      id: "styleGLExample",
      type: "stylegl",
      order: 6,
      minZoom: 0,
      maxZoom: 22,
      visible: true,
      source: {
        styleURL: "https://wms.wheregroup.com/tileserver/style/osm-bright.json",
      },
      metadata: {
        title: "Outdoor Adventure Map",
        abstract:
          "A map designed for outdoor activities, highlighting trails, terrain, and points of interest.",
        source: "Mapbox Styles",
      },
    },
    {
      id: "egyptDSMCOG",
      type: "cog",
      order: 7,
      minZoom: 0,
      maxZoom: 22,
      visible: true,
      source: {
        url: "https://link.storjshare.io/raw/juj37qat4melrpmooioq65fzgo7q/truemaps-public/aw3d30/output_cog.tif",
      },
      metadata: {
        title: "Outdoor Adventure Map",
        abstract:
          "A map designed for outdoor activities, highlighting trails, terrain, and points of interest.",
        source: "Mapbox Styles",
      },
    },
  ],
};

export const enObj: I18nObjects = {
  defaultDataSource: [],

  defaultEchartsJsonOption: {},

  defaultMapJsonOption: defaultMapData,
};
