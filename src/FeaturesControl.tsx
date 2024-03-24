import { ReactNode } from 'react'
import {
    MultiCompBuilder,
    BoolControl,
    withDefault,
} from 'lowcoder-sdk'

export function featureControl(
    config: any,
) {
    const childrenMap: any = new Object();
    Object.keys(config).forEach((k: string, index: any) => {
        childrenMap[k] = withDefault(BoolControl, config[k])
    })
    class FeatureControlTemp extends new MultiCompBuilder(childrenMap, (props: any) => {
        return props
    })
        .setPropertyViewFn((children: any) => (<></>))
        .build() {
        propertyView(params: {
            title: string
        }): ReactNode {
            var list: any = []
            { Object.keys(this.children).forEach((k, index) => { list.push(this.children[k].propertyView({ label: k })) }) }
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
