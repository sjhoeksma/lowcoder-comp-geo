import { I18nObjects } from "./types";

export const enObj: I18nObjects = {
  defaultData: [
    {
      name: "NASA | BlueMarble NextGeneration - WMS",
      type: "wms",
      order: 1,
      minZoom: 0,
      maxZoom: 8,
      visible: true,
      source: {
        url: "https://ideas-digitaltwin.jpl.nasa.gov/wms/epsg4326/best/wms.cgi",
        params: {
          LAYERS: "BlueMarble_NextGeneration",
          TILED: true,
          version: "1.3.0",
        },
        serverType: "geoserver",
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
    },
    {
      name: "GeoJson with Style and Image src",
      type: "geojson",
      order: 8,
      minZoom: 0,
      maxZoom: 22,
      visible: true,
      source: {
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {
                img_src: "https://picsum.photos/400/300",
                title_en: "This is Point 3 Title",
              },
              geometry: {
                coordinates: [31.648544983141022, 30.168372482757235],
                type: "Point",
              },
              id: 0,
            },
            {
              type: "Feature",
              properties: {
                "marker-color": "#25d439",
                "marker-size": "medium",
                "marker-symbol": "circle",
                img_src: "https://picsum.photos/400/300",
                title_en: "This is Point 4 Title",
              },
              geometry: {
                coordinates: [31.609205437222727, 30.15667607035462],
                type: "Point",
              },
              id: 1,
            },
            {
              type: "Feature",
              properties: {
                img_src: "https://picsum.photos/400/300",
                title_en: "This is Point 1 Title",
              },
              geometry: {
                coordinates: [31.616315587975095, 30.12764586201415],
                type: "Point",
              },
              id: 2,
            },
            {
              type: "Feature",
              properties: {
                "marker-color": "#22f40f",
                "marker-size": "medium",
                "marker-symbol": "circle",
                img_src: "https://picsum.photos/400/300",
                title_en: "This is Point 2 Title",
              },
              geometry: {
                coordinates: [31.647216271721106, 30.128195901651907],
                type: "Point",
              },
              id: 3,
            },
            {
              type: "Feature",
              properties: {
                stroke: "#8ec0bf",
                "stroke-width": 2,
                "stroke-opacity": 1,
                fill: "#54e7ab",
                "fill-opacity": 0.5,
                img_src: "https://picsum.photos/400/300",
                title_en: "This is Polygon 1 Title",
              },
              geometry: {
                coordinates: [
                  [
                    [31.663062927451392, 30.106857074945523],
                    [31.65276727632417, 30.106857074945523],
                    [31.65276727632417, 30.09777181176149],
                    [31.663062927451392, 30.09777181176149],
                    [31.663062927451392, 30.106857074945523],
                  ],
                ],
                type: "Polygon",
              },
              id: 4,
            },
            {
              type: "Feature",
              properties: {
                stroke: "#555555",
                "stroke-width": 2,
                "stroke-opacity": 1,
                fill: "#ff91f6",
                "fill-opacity": 1,
                img_src: "https://picsum.photos/400/300",
                title_en: "This is Polygon 2 Title",
              },
              geometry: {
                coordinates: [
                  [
                    [31.636689184721234, 30.09388132659143],
                    [31.62511722772365, 30.09388132659143],
                    [31.62511722772365, 30.08220833646739],
                    [31.636689184721234, 30.08220833646739],
                    [31.636689184721234, 30.09388132659143],
                  ],
                ],
                type: "Polygon",
              },
              id: 5,
            },
            {
              type: "Feature",
              properties: {
                img_src: "https://picsum.photos/400/300",
                stroke: "#5b69ff",
                "stroke-width": 3.3,
                "stroke-opacity": 1,
                title_en: "This is Line Title",
              },
              geometry: {
                coordinates: [
                  [31.636477907863707, 30.101294459203615],
                  [31.65277860477454, 30.1083398631053],
                  [31.655995224561934, 30.116316091824615],
                  [31.648069978547227, 30.117802108513885],
                ],
                type: "LineString",
              },
              id: 6,
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
    },
    {
      name: "World Basemap - MVT/pbf",
      type: "mvt",
      order: 3,
      minZoom: 0,
      maxZoom: 22,
      visible: false,
      source: {
        url: "https://wms.wheregroup.com/tileserver/tile/world-0-14/{z}/{x}/{y}.pbf",
      },
      style: {
        styleURL: "https://wms.wheregroup.com/tileserver/style/osm-bright.json",
      },
    },
    {
      name: "Contours - WFS",
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
    },
    {
      name: "Open Street Map - XYZ",
      type: "xyz",
      order: 0,
      minZoom: 0,
      maxZoom: 19,
      visible: true,
      source: {
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      },
    },
    {
      name: "Style GL Example",
      type: "stylegl",
      order: 6,
      minZoom: 0,
      maxZoom: 22,
      visible: true,
      source: {
        styleURL: "https://wms.wheregroup.com/tileserver/style/osm-bright.json",
      },
    },
    {
      name: "Egypt DSM - COG",
      type: "cog",
      order: 7,
      minZoom: 0,
      maxZoom: 22,
      visible: true,
      opacity: 0.3,
      source: {
        url: "https://link.storjshare.io/raw/juj37qat4melrpmooioq65fzgo7q/truemaps-public/aw3d30/output_cog.tif",
      },
    },
  ],
};
