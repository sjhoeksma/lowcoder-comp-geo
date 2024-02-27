import {
  UICompBuilder,
  NameConfig,
  BoolControl,
  stringSimpleControl,
  JSONObjectControl,
  NumberControl,
  ArrayControl,
  Section,
  withDefault,
  withExposingConfigs,
  eventHandlerControl,
  styleControl,
  jsonObjectExposingStateControl,
  stringExposingStateControl,
  AutoHeightControl,
} from "lowcoder-sdk";
import styles from "./styles.module.css";
import { trans } from "./i18n/comps";
import { Geo } from "./vendors";
import { useResizeDetector } from "react-resize-detector";
import { useState } from "react";
import {version} from '../package.json';
import { ObjectEvent } from "ol/Object";


export const CompStyles = [
  {	
    name: "margin",	
    label: trans("style.margin"),
    margin: "margin",	
  },
  {	
    name: "padding",	
    label: trans("style.padding"),
    padding: "padding",	
  },
  {	
    name: "textSize",
    label: trans("style.textSize"),
    textSize: "textSize",	
  },
  {	
    name: "backgroundColor",
    label: trans("style.backgroundColor"),
    backgroundColor: "backgroundColor",	
  },
  {	
    name: "border",
    label: trans("style.border"),
    border: "border",	
  },
  {
    name : "radius",
    label : trans("style.borderRadius"),
    radius : "radius",
  },
  {
    name : "borderWidth",
    label : trans("style.borderWidth"),
    borderWidth : "borderWidth",
  }
] as const;


let GEOComp = (function () {
  //Function to prevent unneeded redraws
  var _skipRedraw = false
  const skipRedraw = function(){
    var ret = _skipRedraw
    _skipRedraw = false
    return ret
  }

  const childrenMap = {
    autoHeight: withDefault(AutoHeightControl, "fixed"),
    styles: styleControl(CompStyles),
    center: withDefault(ArrayControl,"[4.6999,52.297]"),
    zoom: withDefault(NumberControl,1),
    maxZoom: withDefault(NumberControl,30),
    rotation: withDefault(NumberControl,0),
    pitch: withDefault(NumberControl,0),
    geoJson : jsonObjectExposingStateControl("geoJson"),
    event : jsonObjectExposingStateControl("event"),
    showLogo : withDefault(BoolControl,true),
    onEvent: eventHandlerControl([
      {
        label: "onChange",
        value: "change",
        description: "Triggers when GeoJson data changes",
      },
      {
        label: "onLoadEnd",
        value: "loadend",
        description: "Triggers when GEO data is loaded",
      },
      {
        label: "onClick",
        value: "click",
        description: "Triggers when there is a click within the viewer",
      },
      {
        label: "onZoom",
        value: "zoom",
        description: "Triggers when there is a zoom change within the viewer",
      },
    ] as const),
  };
   
  return new UICompBuilder(childrenMap, (props: {
    onEvent: any;
    styles: { backgroundColor: any; border: any; radius: any; borderWidth: any; 
              margin: any; padding: any; textSize: any; };
    center : any;
    pitch : number;
    zoom : number;
    maxZoom: number;
    rotation: number;
    geoJson: any;
    event : any;
    /*
    values: object | null | undefined;
    svgDownload: boolean;
    imageName : string;
    designer: boolean;
    */
    showLogo : boolean;
    autoHeight: boolean;
  }) => {
  const handleDataChange = (json: string) => {
    //TODO: Set output variable  props.geoJson.onChange(json);
    _skipRedraw = true //We should not redraw the component
    props.geoJson.onChange(json);
    props.onEvent("change");
  };
  const handleLoadEnd= (event : object) =>{
    props.event = event
    props.onEvent("loadend");
  };
  const handleClick = (event : object) =>{
    console.log("GEO Clicked",event)
    props.event = event
    props.onEvent("click");
  }

  const handleZoom= (event: ObjectEvent,newValue : number) =>{
      props.event = Object.assign({},event,{newValue})
      props.onEvent("zoom")
  }
  const [dimensions, setDimensions] = useState({ width: 480, height: 415 });
  const { width, height, ref: conRef } = useResizeDetector({onResize: () =>{
    const container = conRef.current;
    if(!container || !width || !height) return;

    if(props.autoHeight) {
      setDimensions({
        width,
        height: dimensions.height,
      })
      return;
    }

    setDimensions({
      width,
      height,
    })
  }});

  return (
    <div className={styles.wrapper} style={{
      height: "100%",
      width: "100%",
      backgroundColor: `${props.styles.backgroundColor}`,
      borderColor: `${props.styles.border}`,
      borderRadius: `${props.styles.radius}`,
      borderWidth: `${props.styles.borderWidth}`,
      margin: `${props.styles.margin}`,
      padding: `${props.styles.padding}`,
      fontSize: `${props.styles.textSize}`,
    }}>
      <Geo
        center={props.center}
        geoJson={props.geoJson.value}
        zoom={props.zoom}
        maxZoom={props.maxZoom}
        pitch={props.pitch}
        rotation={props.rotation}
        height={dimensions.height}
        width={dimensions.width}
        showLogo={props.showLogo}
        onDataChange={handleDataChange}
        onLoadEnd={handleLoadEnd}
        onZoom={handleZoom}
        onClick={handleClick}
        skipRedraw={skipRedraw}
      />
    </div>
  );
})
.setPropertyViewFn((children: any) => {
  return (
    <>
      <Section name="Config">
        {children.geoJson.propertyView({ label: "geoJson" })}
        {children.center.propertyView({ label: "center" })}
        {children.zoom.propertyView({ label: "zoom" })}
        {children.maxZoom.propertyView({ label: "maxZoom" })}
        {children.pitch.propertyView({ label: "pitch" })}
        {children.rotation.propertyView({ label: "rotation" })}
        <span>Hide <b>logo</b> only if you are entitled</span>
        {children.showLogo.propertyView({ label: "Show logo" })}
      </Section>
      <Section name="Interaction">
        {children.onEvent.propertyView()}
      </Section>
      <Section name="Styles">
        {children.styles.getPropertyView()}
      </Section>
      <div >
        <div style={{"float":"right","marginRight": "15px"}}>Version :  {version}</div>
      </div>  
    </>
  );
})
.build();
})();

GEOComp = class extends GEOComp {
  autoHeight(): boolean {
    return this.children.autoHeight.getView();
  }
};

export default withExposingConfigs(GEOComp, [
  new NameConfig("center", trans("component.center")),
  new NameConfig("zoom", trans("component.zoom")),
  new NameConfig("maxZoom", trans("component.maxZoom")),
  new NameConfig("zoomEventTrigger", trans("component.zoomEventTrigger")),
  new NameConfig("rotation", trans("component.rotation")),
  new NameConfig("pitch", trans("component.pitch")),
  new NameConfig("geoJson", trans("component.geoJson")),
  new NameConfig("event", trans("component.event")),
  new NameConfig("showLogo", trans("component.showLogo")),
]);
