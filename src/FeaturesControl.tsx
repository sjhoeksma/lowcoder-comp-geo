import { ReactNode } from 'react'
import {
    MultiCompBuilder,
    BoolControl,
    withDefault,
} from 'lowcoder-sdk'
import { trans } from "./i18n/comps";


export function featureControl(config?: any) {
    const childrenMap: any = new Object();
    const initConfig = Object.assign({}, config)
    Object.keys(initConfig).forEach((k: string, index: any) => {
        childrenMap[k] = withDefault(BoolControl, initConfig[k])
    })
    //Class is rebuiled not retuning same class 
    class FeatureControlTemp extends new MultiCompBuilder(childrenMap, (props: any) => props)
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
    return FeatureControlTemp;
}