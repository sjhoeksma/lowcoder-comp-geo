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
    JSONObjectControl,
    manualOptionsControl,
} from 'lowcoder-sdk'
import { trans } from "./i18n/comps";
import { Divider } from "antd"


function layerSourceControl() {
    // const childrenMap: any =
    const childrenMap: any = {
        url: stringSimpleControl(),
        attributions: withDefault(StringControl, ''),

        params: StringControl,
        serverType: stringSimpleControl(),
        crossOrigin: stringSimpleControl(),

        data: StringOrJSONObjectControl, // This could be a URL or a GeoJSON object ?
        projection: stringSimpleControl(),

        tileSize: withDefault(NumberControl, 512),
        nodata: withDefault(NumberControl, 0),

        ratio: withDefault(NumberControl, 1),
    };

    //Class is rebuiled not retuning same class 
    class LayerSourceTemp extends new MultiCompBuilder(childrenMap, (props: any) => props)
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
                        ]
                    case 'arcgis-mapserver-tile':
                        return [
                            'url',
                            'params', // Optional: parameters for the ArcGIS service
                            'crossOrigin',
                        ]
                    case 'arcgis-mapserver-image':
                        return [
                            'url',
                            'params', // Optional: parameters for the ArcGIS service
                            'ratio',
                            'crossOrigin',
                        ]
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
                    <Divider orientation="left" dashed orientationMargin="0px" style={{ margin: "0px" }} >
                        {trans("layer.source")}
                    </Divider>
                    {list}
                    <Divider orientation="left" dashed orientationMargin="0px" style={{ margin: "0px" }} >
                        {trans("layer.settings")}
                    </Divider>
                </>
            );
        }
    }
    return LayerSourceTemp;
}

var LayerObjectOption = new MultiCompBuilder(
    {
        label: StringControl,
        title: StringControl,
        type: dropdownControl([
            { label: "mvt", value: "mvt" },
            { label: "wms", value: "wms" },
            { label: "wfs", value: "wfs" },
            { label: "xyz", value: "xyz" },
            { label: "geojson", value: "geojson" },
            { label: "cog", value: "cog" },
            { label: "stylegl", value: "stylegl" },
            { label: "arcgis-mapserver-tile", value: "arcgis mapserver tile" },
            { label: "arcgis-mapserver-image", value: "arcgis mapserver image" }
        ]),
        source: layerSourceControl(),
        visible: withDefault(BoolPureControl, true),
        selectable: withDefault(BoolPureControl, true),
        userVisible: withDefault(BoolPureControl, true),
        order: NumberControl,
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

LayerObjectOption = class extends LayerObjectOption {
    constructor(obj: any) {
        if (obj.value) {
            if (obj.value.style && typeof obj.value.style != "string") {
                obj.value.style = JSON.stringify(obj.value.style, null)
            }
            if (obj.value.source && obj.value.source.data && typeof obj.value.source.data != "string") {
                obj.value.source.data = JSON.stringify(obj.value.source.data, null)
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
                list.push(this.children[k].propertyView({ label: trans(`layer.${k}`), }))
            }
        })
        return (
            <>  <Divider orientation="left" dashed orientationMargin="0px" style={{ margin: "0px" }}>
                {trans("layer.map")}</Divider>
                {list}
            </>
        );
    }
};


//TODO: Change this to a function so it can be used directly instead of data

export function layersControl(config?: any) {
    const manualOptions = config ? config : [
        { label: "Test", title: "test" }
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