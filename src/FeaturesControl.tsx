import { ReactNode } from 'react'
import {
    MultiCompBuilder,
    BoolPureControl,
    withDefault,
} from 'lowcoder-sdk'
import { trans } from "./i18n/comps";


/**
 * Generates a feature control component by mapping feature flag keys 
 * to boolean controls.
 * 
 * Accepts a config object with feature flag keys mapped to their default 
 * enabled values. Renders boolean controls for each feature flag, with 
 * getView() returning the current enabled state of each flag.
 */
export function featureControl(config?: any) {
    const childrenMap: any = new Object();
    const initConfig = Object.assign({}, config)
    Object.keys(initConfig).forEach((k: string, index: any) => {
        childrenMap[k] = withDefault(BoolPureControl, initConfig[k])
    })
    //Class is rebuild not retuning same class 
    class FeatureControlTemp extends new MultiCompBuilder(childrenMap, (props: any) => props)
        .setPropertyViewFn((children: any) => (<></>))
        .build() {

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