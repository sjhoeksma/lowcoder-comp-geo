import { ReactNode, useState } from 'react';
import { ColorPicker } from "antd";
import {
    MultiCompBuilder,
    BoolControl,
    StringControl,
    stringSimpleControl,
    NumberControl,
    withDefault,
    dropdownControl,
    StringOrJSONObjectControl,
    ArrayOrJSONObjectControl,
    manualOptionsControl,
    ArrayControl,
} from 'lowcoder-sdk';
import { trans } from "./i18n/comps";
import { Divider } from "antd";

/**
 * Creates a SourceControl component that allows configuring the source 
 * parameters for a map layer. It is a customized MultiCompBuilder that
 * generates different source parameters based on the layer type.
 * The propertyView method renders a UI for configuring the relevant 
 * source parameters.
 */
export function SourceControl() {

    const childrenMap: any = {
        url: stringSimpleControl(),
        attributions: withDefault(StringControl, ''),
        params: StringOrJSONObjectControl,
        serverType: withDefault(dropdownControl([
            { label: "Geoserver", value: "geoserver" },
            { label: "Mapserer", value: "mapserver" },
            { label: "Carmentaserver", value: "carmentaserver" },
            { label: "QGIS Server", value: "qgis" },
        ]), 'geoserver'),
        crossOrigin: stringSimpleControl(),
        data: StringOrJSONObjectControl,
        projection: withDefault(stringSimpleControl(), `EPSG:3857`),
        tileSize: withDefault(ArrayControl, [256, 256]),
        nodata: withDefault(NumberControl, 0),
        ratio: withDefault(NumberControl, 1),
        style: withDefault(ArrayOrJSONObjectControl),
        pmtilesType: withDefault(dropdownControl([
            { label: "Raster", value: "raster" },
            { label: "Vector", value: "vector" },
        ]), 'vector'),
        mapServerType: withDefault(dropdownControl([
            { label: "Image", value: "image" },
            { label: "Tile", value: "tile" },
        ]), 'tile'),
    };

    class SourceTemp extends new MultiCompBuilder(childrenMap, (props: any) => props)
        .setPropertyViewFn((children: any) => (<></>))
        .build() {

        propertyView(params: {
            label: string,
            type: any
        }): ReactNode {
            function layerSourceChildren(layerType: string) {
                const baseChildren = {
                    'mvt': ['url', 'attributions'],
                    'wms': ['url', 'params', 'serverType', 'crossOrigin'],
                    'wfs': ['url'],
                    'xyz': ['url'],
                    'geojson': ['data', 'projection'],
                    'cog': ['url', 'tileSize', 'nodata', 'projection'],
                    'stylegl': ['url', 'projection'],
                    'arcgis-mapserver': ['mapServerType', 'url', 'params', 'ratio', 'crossOrigin'],
                    'pmtiles': ['pmtilesType', 'url', 'tileSize', 'style'],
                    'arcgis-vector-tiles': ['url', 'projection'],
                    'arcgis-feature-service': ['url', 'projection'],
                }[layerType] || []; // Default to empty configuration

                return baseChildren;
            }

            var list = [];
            layerSourceChildren(params.type).forEach(k => {
                list.push(this.children[k].propertyView({ label: trans(`layer.${k}`) }));
            });

            // Include ColorPicker for PMTiles Vector Type
            if (params.type === 'pmtiles' && this.children.pmtilesType.value === 'vector') {
                list.push(<ColorPicker key="color-picker" />);
            }

            return (
                <>
                    <Divider orientation="left" dashed orientationMargin="0px" style={{ margin: "0px" }} key="div-layer-source" >
                        {trans("layer.source")}
                    </Divider>
                    {list}
                    <Divider orientation="left" dashed orientationMargin="0px" style={{ margin: "0px" }} key="div-layer-settings">
                        {trans("layer.settings")}
                    </Divider>
                </>
            );
        }
    }
    return SourceTemp;
}

/**
 * Creates a LayerObjectOption component using MultiCompBuilder.
 * Allows configuring properties like label, title, source etc for a layer.
 * Provides controls for selecting layer type, visibility, opacity etc.
 * Handles rendering the layer options.
 */
var LayerObjectOption = new MultiCompBuilder(
    {
        label: StringControl,
        title: StringControl,
        type: dropdownControl([
            { label: "XYZ", value: "xyz" },
            { label: "WMS", value: "wms" },
            { label: "WFS", value: "wfs" },
            { label: "GeoJSON", value: "geojson" },
            { label: "COG / GeoTIFF", value: "cog" },
            { label: "MVT", value: "mvt" },
            { label: "Mapbox StyleGL", value: "stylegl" },
            { label: "ArcGIS Mapserver", value: "arcgis-mapserver" },
            { label: "ArcGIS Feature Service", value: "arcgis-feature-service" },
            { label: "ArcGIS Vector Tiles", value: "arcgis-vector-tiles" },
            { label: "PMTiles", value: "pmtiles" },
        ]),
        style: withDefault(ArrayOrJSONObjectControl),
        source: SourceControl(),
        visible: withDefault(BoolControl, true),
        selectable: withDefault(BoolControl, true),
        userVisible: withDefault(BoolControl, true),
        minZoom: withDefault(NumberControl, 0),
        maxZoom: withDefault(NumberControl, 30),
        opacity: withDefault(NumberControl, 1),
        groups: StringControl,
        splitscreen: dropdownControl([
            { label: "No", value: "" },
            { label: "Left", value: "left" },
            { label: "Right", value: "right" }]),
        timeline: StringControl,
    },
    (props: any) => props)
    .setPropertyViewFn((children: any) => (<></>))
    .build();

/**
 * Creates a LayerObjectOption component using MultiCompBuilder.
 * Allows configuring properties like label, title, source etc for a layer.
 * Provides controls for selecting layer type, visibility, opacity etc.
 * Handles rendering the layer options.
 */
LayerObjectOption = class extends LayerObjectOption {
    constructor(obj: any) {
        if (obj.value) {
            if (obj.value.style && typeof obj.value.style != "string") {
                obj.value.style = JSON.stringify(obj.value.style, null, 2)
            }
            if (obj.value.source && obj.value.source.data && typeof obj.value.source.data != "string") {
                obj.value.source.data = JSON.stringify(obj.value.source.data, null, 2)
            }
            if (obj.value.source && obj.value.source.params && typeof obj.value.source.params != "string") {
                obj.value.source.params = JSON.stringify(obj.value.source.params, null, 2)
            }
            if (obj.value.source && obj.value.source.tileSize && typeof obj.value.source.tileSize != "string") {
                obj.value.source.tileSize = JSON.stringify(obj.value.source.tileSize, null, 2);
            }
        }
        super(obj);
    }

    propertyView(param: { autoMap?: boolean }) {
        var list: any = [];
        Object.keys(this.children).forEach((k, index) => {
            if (k == "source") {
                list.push(this.children[k].propertyView({ label: trans(`layer.${k}`), type: this.children['type'].value }));
            } else {
                list.push(this.children[k].propertyView({ label: trans(`layer.${k}`) }));
            }
        });
        return (
            <>
                <Divider orientation="left" dashed orientationMargin="0px" style={{ margin: "0px" }} key="div-layer-map">
                    {trans("layer.layer")}
                </Divider>
                {list}
            </>
        );
    }
};

/**
 * Creates a LayersControl component using MultiCompBuilder to configure layer options.
 * Allows selecting layer type, visibility, opacity etc. 
 * Handles rendering the layer options and returns the LayersControl class.
 */
export function layersControl(config?: any) {
    const manualOptions = config ? config : [
        { label: "Layer1", title: "Layer" }
    ];
    const childrenMap: any = {
        data: manualOptionsControl(LayerObjectOption, {
            initOptions: manualOptions,
            uniqField: "label"
        })
    };

    class LayersControlTemp extends new MultiCompBuilder(childrenMap, (props: any) => props)
        .setPropertyViewFn((children: any) => (<></>))
        .build() {

        constructor(obj: any) {
            super(obj);
        }

        propertyView(params: {
            title: string
        }): ReactNode {
            return (
                <>
                    {this.children.data.propertyView({ title: params.title, newOptionLabel: trans("layer.layer") })}
                </>
            );
        }

        orgView: any;
        getView(): any {
            const p = super.getView();
            var changed = JSON.stringify(p, null, 2) != JSON.stringify(this.orgView, null, 2);
            if (changed) {
                this.orgView = p;
                return p;
            }
            return this.orgView;
        }
    }
    return LayersControlTemp;
}
