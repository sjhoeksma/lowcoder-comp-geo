import {
    MultiCompBuilder,
    StringControl,
    BoolPureControl,
    withDefault,
    manualOptionsControl
} from 'lowcoder-sdk'
import { trans } from "./i18n/comps";

var BoolObjectOption = new MultiCompBuilder(
    {
        label: StringControl,
        value: withDefault(BoolPureControl, true),
    },
    (props: any) => props
).build();

BoolObjectOption = class extends BoolObjectOption {
    propertyView() {
        return (
            <>
                {this.children.label.propertyView({
                    name: trans("key"),
                    placeholder: "buttonName",
                })}
                {this.children.value.propertyView({ label: trans("active") })}
            </>
        );
    }
};

export const boolObjectOptionControl = function (options: object) {
    //ConvertObject to Array
    if (!options) {
        return manualOptionsControl(BoolObjectOption, {
            initOptions: [
                { label: "button1", value: true },
                { label: "button2", value: false },
            ],
            uniqField: "label",
        })
    }

    var optionsRec = []
    for (const [key, value] of Object.entries(options)) {
        optionsRec.push({ label: key, value: value });
    }
    return manualOptionsControl(BoolObjectOption, {
        initOptions: optionsRec,
        uniqField: "label",
    })
}



