import { ReactNode } from 'react'
import {
    MultiCompBuilder,
    BoolPureControl,
    StringControl,
    stringSimpleControl,
    NumberControl,
    withDefault,
    dropdownControl,
    StringOrJSONObjectControl,
    manualOptionsControl,
    ArrayControl,
} from 'lowcoder-sdk'
import { trans } from "./i18n/comps";
import { Divider } from "antd"


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

        data: StringOrJSONObjectControl, // This could be a URL or a GeoJSON object ?
        projection: stringSimpleControl(),

        tileSize: withDefault(ArrayControl, [256, 256]),
        nodata: withDefault(NumberControl, 0),

        ratio: withDefault(NumberControl, 1),
        style: StringOrJSONObjectControl,

        pmtilesType: withDefault(dropdownControl([
            { label: "Raster", value: "raster" },
            { label: "Vector", value: "vector" },
        ]), 'vector'),
        mapServerType: withDefault(dropdownControl([
            { label: "Image", value: "image" },
            { label: "Tile", value: "tile" },
        ]), 'tile'),
    };


    //Class is rebuild not retuning same class 
    class SourceTemp extends new MultiCompBuilder(childrenMap, (props: any) => props)
        .setPropertyViewFn((children: any) => (<></>))
        .build() {

        propertyView(params: {
            label: string,
            type: any
        }): ReactNode {
            function layerSourceChildren(layerType: string) {
                switch (layerType) {
                    case 'mvt':
                        return [
                            'url',
                            'attributions'
                        ]
                    case 'wms':
                        return [
                            'url',
                            'params',
                            'serverType',
                            'crossOrigin',
                        ]
                    case 'wfs':
                        return [
                            'url',
                        ]
                    case 'xyz':
                        return [
                            'url'
                        ]
                    case 'geojson':
                        return [
                            'data', // This could be a URL or a GeoJSON object ?
                            'projection',
                        ]
                    case 'cog':
                        return [
                            'url',
                            'tileSize',
                            'nodata',
                            'projection',
                        ]
                    case 'stylegl':
                        return [
                            'url', // Style JSON URL
                            'projection',
                            'style',
                        ]
                    case 'arcgis-mapserver':
                        return [
                            'mapServerType',
                            'url',
                            'params', // Optional: parameters for the ArcGIS service
                            'ratio',
                            'crossOrigin',
                        ]
                    case 'pmtiles':
                        return [
                            'pmtilesType',
                            'url',
                            'tileSize',
                        ]
                    case 'arcgis-vector-tiles':
                        return [
                            'url',
                            'projection',
                        ];
                    case 'arcgis-feature-service':
                        return [
                            'url',
                            'projection',
                        ];
                    default:
                        return [] // Empty configuration for unsupported types
                }
            }
            var list: any = []
            layerSourceChildren(params.type).forEach(k => {
                list.push(this.children[k].propertyView({ label: trans(`layer.${k}`) }))
            })

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
        source: SourceControl(),
        visible: withDefault(BoolPureControl, true),
        selectable: withDefault(BoolPureControl, true),
        userVisible: withDefault(BoolPureControl, true),
        minZoom: withDefault(NumberControl, 0),
        maxZoom: withDefault(NumberControl, 30),
        opacity: withDefault(NumberControl, 1),

        groups: StringControl,
        splitscreen: dropdownControl([
            { label: "No", value: "" },
            { label: "Left", value: "left" },
            { label: "Right", value: "right" }]),
        timeline: StringControl,
        //  style: JSONObjectControl,
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
                obj.value.style = JSON.stringify(obj.value.style, null)
            }
            if (obj.value.source && obj.value.source.data && typeof obj.value.source.data != "string") {
                obj.value.source.data = JSON.stringify(obj.value.source.data, null)
            }
            if (obj.value.source && obj.value.source.params && typeof obj.value.source.params != "string") {
                obj.value.source.params = JSON.stringify(obj.value.source.params, null)
            }
            if (obj.value.source && obj.value.source.tileSize && typeof obj.value.source.tileSize != "string") {
                obj.value.source.tileSize = JSON.stringify(obj.value.source.tileSize, null);
            }
        }
        super(obj)
    }
    propertyView(param: { autoMap?: boolean }) {
        var list: any = []
        Object.keys(this.children).forEach((k, index) => {
            if (k == "source") {
                list.push(this.children[k].propertyView({ label: trans(`layer.${k}`), type: this.children['type'].value }))
            } else {
                list.push(this.children[k].propertyView({ label: trans(`layer.${k}`) }))
            }
        })
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
    ]
    const childrenMap: any = {
        data: manualOptionsControl(LayerObjectOption, {
            initOptions: manualOptions,
            uniqField: "label"
        })
    };

    //Class is rebuiled not retuning same class 
    class LayersControlTemp extends new MultiCompBuilder(childrenMap, (props: any) => props)
        .setPropertyViewFn((children: any) => (<></>))
        .build() {

        constructor(obj: any) {
            super(obj)
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
        orgView: any
        getView(): any {
            const p = super.getView()
            var changed = JSON.stringify(p, null) != JSON.stringify(this.orgView, null)
            if (changed) {
                this.orgView = p
                return p
            }
            return this.orgView
        }
    }
    return LayersControlTemp;
}