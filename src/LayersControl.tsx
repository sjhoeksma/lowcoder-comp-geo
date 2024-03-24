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
        opacity: withDefault(NumberControl, 100),
        label: stringSimpleControl(),
        state: withDefault(BoolPureControl, true),
        //sublevel: layerSubLeveObjectControl(),
    },
    (props: any) => props
).build();

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