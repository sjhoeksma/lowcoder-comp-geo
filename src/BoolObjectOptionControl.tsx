import {
    MultiCompBuilder,
    StringControl,
    BoolPureControl,
    withDefault,
    BoolControl,
    disabledPropertyView,
    hiddenPropertyView,
    optionsControl,
} from 'lowcoder-sdk'
import { trans } from "./i18n/comps";

type OptionPropertyParam = {
    autoMap?: boolean;
};

interface OptionCompProperty {
    propertyView(param: OptionPropertyParam): React.ReactNode;
}

var BoolObjectOption = new MultiCompBuilder(
    {
        label: StringControl,
        state: withDefault(BoolPureControl, true),
    },
    (props: any) => props
).build();

BoolObjectOption = class extends BoolObjectOption implements OptionCompProperty {
    propertyView(param: { autoMap?: boolean }) {
        return (
            <>
                {this.children.label.propertyView({
                    name: trans("label"),
                    placeholder: param.autoMap ? "buttonName" : "",
                })}
                {this.children.state.propertyView({ label: trans("state") })}
            </>
        );
    }
};

export const BoolObjectOptionControl = optionsControl(BoolObjectOption, {
    initOptions: [
        { label: "button1", state: true },
        { label: "button2", state: false },
    ],
    uniqField: "label",
});

export function boolObjectOptionControl(defaultValue: any) {
    return optionsControl(BoolObjectOption, {
        initOptions: defaultValue ? defaultValue : [
            { label: "button1", state: true },
            { label: "button2", state: false },
        ],
        uniqField: "label",
    })
}

