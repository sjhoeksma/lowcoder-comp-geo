import { I18nObjects } from "./types";

export const enObj: I18nObjects = {
  defaultData: [
    {
      "label": "ArcGIS Feature Servies",
      "title": "ArcGIS Feature Servies",
      "type": "arcgis-feature-service",
      "order": 11,
      "minZoom": 0,
      "maxZoom": 22,
      "visible": true,
      "selectable": true,
      "source": {
        "url": "https://services-eu1.arcgis.com/NPIbx47lsIiu2pqz/ArcGIS/rest/services/Neptune_Coastline_Campaign_Open_Data_Land_Use_2014/FeatureServer/0",
      }
    },
    {
      "label": "ArcGIS - Vector Tile PBF",
      "title": "ArcGIS - Vector Tile PBF",
      "type": "arcgis-vector-tiles",
      "order": 10,
      "minZoom": 0,
      "maxZoom": 22,
      "visible": true,
      "selectable": true,
      "source": {
        "url": "https://rijnland.enl-mcs.nl/arcgis/rest/services/Polder/MapServer/0/",
        "projection": "EPSG:28992",
      }
    },
    {
      "label": "PMTiles - Raster",
      "title": "PMTiles - Raster",
      "type": "pmtiles",
      "order": 9,
      "minZoom": 0,
      "maxZoom": 30,
      "visible": false,
      "selectable": false,
      "source": {
        "pmtilesType": "raster",
        "url": "https://r2-public.protomaps.com/protomaps-sample-datasets/terrarium_z9.pmtiles",
        "tileSize": [512, 512],
      }
    },
    {
      "label": "PMTiles - Vector",
      "title": "PMTiles - Vector",
      "type": "pmtiles",
      "order": 8,
      "minZoom": 0,
      "maxZoom": 30,
      "visible": false,
      "selectable": false,
      "source": {
        "pmtilesType": "vector",
        "url": "https://link.storjshare.io/raw/jxqj5ixgrdniigc7f23mogdzeirq/truemaps-public%2Fpublic-datasets%2Foverturemaps%2F2024-01-17-alpha.0%2Ftheme%3Dbuildings%2Fegypt_buildings_vt.pmtiles",
      }
    },
    {
      "label": "GeoJson",
      "title": "GeoJson with Style and Image src",
      "type": "geojson",
      "order": 7,
      "minZoom": 0,
      "maxZoom": 22,
      "visible": true,
      "selectable": true,
      "source": {
        "peojection": "EPSG:4326",
        "data": {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "properties": {
                "img_src": "https://picsum.photos/id/0/400/300",
                "title_en": "This is Point 3 Title"
              },
              "geometry": {
                "coordinates": [
                  31.648544983141022,
                  30.168372482757235
                ],
                "type": "Point"
              },
              "id": 0
            },
            {
              "type": "Feature",
              "properties": {
                "marker-color": "#25d439",
                "marker-size": "medium",
                "marker-symbol": "circle",
                "img_src": "https://picsum.photos/id/1/400/300",
                "title_en": "This is Point 4 Title"
              },
              "geometry": {
                "coordinates": [
                  31.609205437222727,
                  30.15667607035462
                ],
                "type": "Point"
              },
              "id": 1
            },
            {
              "type": "Feature",
              "properties": {
                "img_src": "https://picsum.photos/id/2/400/300",
                "title_en": "This is Point 1 Title"
              },
              "geometry": {
                "coordinates": [
                  31.616315587975095,
                  30.12764586201415
                ],
                "type": "Point"
              },
              "id": 2
            },
            {
              "type": "Feature",
              "properties": {
                "marker-color": "#22f40f",
                "marker-size": "medium",
                "marker-symbol": "circle",
                "img_src": "https://picsum.photos/id/3/400/300",
                "title_en": "This is Point 2 Title"
              },
              "geometry": {
                "coordinates": [
                  31.647216271721106,
                  30.128195901651907
                ],
                "type": "Point"
              },
              "id": 3
            },
            {
              "type": "Feature",
              "properties": {
                "stroke": "#8ec0bf",
                "stroke-width": 2,
                "stroke-opacity": 1,
                "fill": "#54e7ab",
                "fill-opacity": 0.5,
                "img_src": "https://picsum.photos/id/4/400/300",
                "title_en": "This is Polygon 1 Title"
              },
              "geometry": {
                "coordinates": [
                  [
                    [
                      31.663062927451392,
                      30.106857074945523
                    ],
                    [
                      31.65276727632417,
                      30.106857074945523
                    ],
                    [
                      31.65276727632417,
                      30.09777181176149
                    ],
                    [
                      31.663062927451392,
                      30.09777181176149
                    ],
                    [
                      31.663062927451392,
                      30.106857074945523
                    ]
                  ]
                ],
                "type": "Polygon"
              },
              "id": 4
            },
            {
              "type": "Feature",
              "properties": {
                "stroke": "#555555",
                "stroke-width": 2,
                "stroke-opacity": 1,
                "fill": "#ff91f6",
                "fill-opacity": 1,
                "img_src": "https://picsum.photos/id/5/400/300",
                "title_en": "This is Polygon 2 Title"
              },
              "geometry": {
                "coordinates": [
                  [
                    [
                      31.636689184721234,
                      30.09388132659143
                    ],
                    [
                      31.62511722772365,
                      30.09388132659143
                    ],
                    [
                      31.62511722772365,
                      30.08220833646739
                    ],
                    [
                      31.636689184721234,
                      30.08220833646739
                    ],
                    [
                      31.636689184721234,
                      30.09388132659143
                    ]
                  ]
                ],
                "type": "Polygon"
              },
              "id": 5
            },
            {
              "type": "Feature",
              "properties": {
                "img_src": "https://picsum.photos/id/6/400/300",
                "stroke": "#5b69ff",
                "stroke-width": 3.3,
                "stroke-opacity": 1,
                "title_en": "This is Line Title"
              },
              "geometry": {
                "coordinates": [
                  [
                    31.636477907863707,
                    30.101294459203615
                  ],
                  [
                    31.65277860477454,
                    30.1083398631053
                  ],
                  [
                    31.655995224561934,
                    30.116316091824615
                  ],
                  [
                    31.648069978547227,
                    30.117802108513885
                  ]
                ],
                "type": "LineString"
              },
              "id": 6
            }
          ]
        }
      },
      "style": {
        "fill-color": [
          "string",
          [
            "get",
            "COLOR"
          ],
          "#eee"
        ],
        "styleOptions": {
          "background": "#1a2b39",
          "color": "#4264fb",
          "weight": 2,
          "opacity": 0.8
        }
      }
    },
    {
      "label": "Egypt DSM - COG",
      "type": "cog",
      "order": 6,
      "minZoom": 0,
      "maxZoom": 22,
      "visible": true,
      "opacity": 0.3,
      "source": {
        "url": "https://link.storjshare.io/raw/juj37qat4melrpmooioq65fzgo7q/truemaps-public/aw3d30/output_cog.tif",
      },
    },
    {
      "label": "Contours - WFS",
      "type": "wfs",
      "order": 5,
      "minZoom": 0,
      "maxZoom": 22,
      "visible": true,
      "source": {
        "url": "https://services.seismofaults.eu/geoserver/EDSF/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=EDSF%3Asubduction_contours&outputFormat=JSON&srsName=urn%3Ax-ogc%3Adef%3Acrs%3AEPSG%3A4326&maxFeatures=1000",
        "format": "geojson",
        "version": "1.1.0",
      },
      "style": {
        "circle-radius": 6,
        "circle-color": "#B42222",
      },
    },
    {
      "label": "World Basemap - MVT/pbf",
      "type": "mvt",
      "order": 4,
      "minZoom": 0,
      "maxZoom": 22,
      "splitscreen": "left",
      "visible": false,
      "source": {
        "url": "https://wms.wheregroup.com/tileserver/tile/world-0-14/{z}/{x}/{y}.pbf",
      },
      "style": {
        "styleURL": "https://wms.wheregroup.com/tileserver/style/osm-bright.json",
      },
    },
    {
      "label": "USA MapServer ImageLayer - ArcGIS MapServer",
      "type": "arcgis-mapserver",
      "order": 3,
      "minZoom": 0,
      "maxZoom": 22,
      "visible": false,
      "selectable": false,
      "source": {
        "mapServerType": "image",
        "url": "https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/USA/MapServer",
        "ratio": 1,
      },
    },
    {
      "label": "USA MapServer TileLayer - ArcGIS MapServer",
      "type": "arcgis-mapserver",
      "order": 2,
      "minZoom": 0,
      "maxZoom": 22,
      "visible": false,
      "selectable": true,
      "source": {
        "mapServerType": "tile",
        "url": "https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/USA/MapServer",
      },
    },
    {
      "label": "NASA | BlueMarble NextGeneration - WMS",
      "type": "wms",
      "order": 1,
      "minZoom": 0,
      "maxZoom": 8,
      "visible": true,
      "source": {
        "url": "https://ideas-digitaltwin.jpl.nasa.gov/wms/epsg4326/best/wms.cgi",
        "params": {
          "LAYERS": "BlueMarble_NextGeneration",
          "TILED": true,
          "VERSION": "1.3.0",
        },
        "serverType": "geoserver",
        "transition": 0,
      },
      "opacity": 1,
    },
    {
      "label": "Mapbox Style GL - JSON",
      "type": "stylegl",
      "order": 0,
      "minZoom": 0,
      "maxZoom": 22,
      "visible": false,
      "opacity": 1,
      "selectable": false,
      "splitscreen": "right",
      "source": {
        "url": "https://wms.wheregroup.com/tileserver/style/osm-bright.json",
        "projection": "EPSG:3857",
      },
    },
    {
      "label": "Open Street Map - XYZ",
      "type": "xyz",
      "order": -1,
      "minZoom": 0,
      "maxZoom": 19,
      "visible": true,
      "source": {
        "url": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      },
    },
  ],
};
