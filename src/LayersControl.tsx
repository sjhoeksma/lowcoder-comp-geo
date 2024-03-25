import { ReactNode } from 'react'
import {
    MultiCompBuilder,
    BoolPureControl,
    StringControl,
    stringSimpleControl,
    NumberControl,
    withDefault,
} from 'lowcoder-sdk'
import { trans } from "./i18n/comps";

var subLevel = new MultiCompBuilder(
    {

    }
)

var LayerBaseObject = new MultiCompBuilder(
    {
        type: stringSimpleControl(),
        name: stringSimpleControl(),
        minZoom: withDefault(NumberControl, 0),
        maxZoom: withDefault(NumberControl, 30),
        visible: withDefault(BoolPureControl, true),
        opacity: withDefault(NumberControl, 1),
        label: stringSimpleControl(),
        state: withDefault(BoolPureControl, true),
        sublevel: layerSubLevelObjectControl("geojson"),
    },
    (props: any) => props
).build();

function layerSubLevelObjectControl(layerType: string) {
    switch (layerType) {
        case 'mvt':
            return new MultiCompBuilder({
                source: {
                    url: stringSimpleControl(),
                    attributions: withDefault(StringControl, ''),
                }
            }, (props: any) => props).build();
        case 'wms':
            return new MultiCompBuilder({
                source: {
                    url: stringSimpleControl(),
                    params: StringControl,
                    serverType: stringSimpleControl(),
                    crossOrigin: stringSimpleControl(),
                }
            }, (props: any) => props).build();
        case 'wfs':
            return new MultiCompBuilder({
                source: {
                    url: stringSimpleControl(),
                }
            }, (props: any) => props).build();
        case 'xyz':
            return new MultiCompBuilder({
                source: {
                    url: stringSimpleControl(),
                }
            }, (props: any) => props).build();
        case 'geojson':
            return new MultiCompBuilder({
                source: {
                    data: stringSimpleControl(), // This could be a URL or a GeoJSON object ?
                    projection: stringSimpleControl(),
                }
            }, (props: any) => props).build();
        case 'cog':
            return new MultiCompBuilder({
                source: {
                    url: stringSimpleControl(),
                    tileSize: withDefault(NumberControl, 512),
                    nodata: withDefault(NumberControl, 0),
                    projection: stringSimpleControl(),
                }
            }, (props: any) => props).build();
        case 'stylegl':
            return new MultiCompBuilder({
                source: {
                    url: stringSimpleControl(), // Style JSON URL
                    projection: stringSimpleControl(),
                }
            }, (props: any) => props).build();
        case 'arcgis-mapserver-tile':
            return new MultiCompBuilder({
                source: {
                    url: stringSimpleControl(),
                    params: StringControl, // Optional: parameters for the ArcGIS service
                    crossOrigin: stringSimpleControl(),
                }
            }, (props: any) => props).build();
        case 'arcgis-mapserver-image':
            return new MultiCompBuilder({
                source: {
                    url: stringSimpleControl(),
                    params: StringControl, // Optional: parameters for the ArcGIS service
                    ratio: withDefault(NumberControl, 1),
                    crossOrigin: stringSimpleControl(),
                }
            }, (props: any) => props).build();
        default:
            console.warn(`Unsupported layer type: ${layerType}`);
            return new MultiCompBuilder({}, (props: any) => props).build(); // Empty configuration for unsupported types
    }
}

export function layersControl(config?: any) {
    const childrenMap: any = new Object();
    const initConfig = Object.assign({}, config)
    Object.keys(initConfig).forEach((k: string, index: any) => {
        childrenMap[k] = withDefault(BoolPureControl, initConfig[k])
    })
    //Class is rebuiled not retuning same class 
    class LayersControlTemp extends new MultiCompBuilder(childrenMap, (props: any) => props)
        .setPropertyViewFn((children: any) => (<></>))
        .build() {

        getView(): any {
            const p = super.getView()
            var changed = false
            Object.keys(p).forEach((k) => {
                if (initConfig[k] != p[k]) {
                    initConfig[k] = p[k]
                    changed = true
                }
            })
            if (changed) {
                return super.getView()
            }
            return initConfig
        }
        propertyView(params: {
            title: string
        }): ReactNode {
            var list: any = []
            Object.keys(this.children).forEach((k, index) => {
                list.push(this.children[k].propertyView({ label: trans(`features.${k}`) }))
            })

            return (
                <>
                    {params.title}
                    {list}
                </>
            );
        }
    }
    return LayersControlTemp;
}