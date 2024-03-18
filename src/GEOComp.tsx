import { useState,useEffect,useCallback } from 'react';
import {
  UICompBuilder,
  NameConfig,
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
  AutoHeightControl,
  arrayStringExposingStateControl,
  withMethodExposing,
} from "lowcoder-sdk";
import styles from "./styles.module.css";
import { trans } from "./i18n/comps";
import { Geo } from "./vendors";
import { useResizeDetector } from "react-resize-detector";
import {version} from '../package.json';
import {animateToLocation} from './vendors/helpers/Animate'


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


var GEOComp = (function () {
  /* By setting the following items within default you can control behavior
     center:[] will disable automatich centering
     debug: true will show eventlog to console
     buttons: { //All buttons are shown by default
        menu: false,
        zoom: false,
        draw: false, //Will disable all draw buttons
        draw:select : false,
        draw:point : false,
        draw:line: false,
        draw:polygon: false,
        draw:delete: false
        draw:redo: false,
        draw:undo: false,
        tracker:save:false,
        scale:false,
        fullscreen:false,
        layers:false,
        swipeVertical: false,
        swipeHorizontal: false,
        timeline: false,
        location:false,
        tracker :false,
        rotateNorth: false,
      }
  */
  const events = [
    {
      label: "onDraw",
      value: "draw",
      description: "Triggers when drawLayer data changes",
    },
    {
      label: "onTracker",
      value: "tracker",
      description: "Triggers when trackerLayer data changes",
    },
    {
      label: "onLoad",
      value: "map:loaded",
      description: "Triggers when GEO data is loaded",
    },
    {
      label: "onInit",
      value: "map:init",
      description: "Triggers when the mapobject is created",
    },
    {
      label: "onSwipe",
      value: "swipe",
      description: "Triggers when on swipe events",
    },
    {
      label: "onClick",
      value: "click",
      description: "Triggers when there is a click within the viewer",
    },
    {
      label: "onBbox",
      value: "bbox",
      description: "Triggers when there is a bbox change",
    },
    {
      label: "onEvent",
      value: "event",
      description: "Triggers when there is no special event handler is triggered",
    },
  ];
  const childrenMap = {
    autoHeight: withDefault(AutoHeightControl, "auto"),
    styles: styleControl(CompStyles),
    defaults: withDefault(JSONObjectControl,`{
      zoom:10,
      maxZoom:30,
      menuTitle: "Menu",
      menuContent: "No Content",
      buttons: { 
        draw: true
      },
      debug:true
    }`),
    center: ArrayControl,
    layers: withDefault(ArrayControl,`[
      {
        type : 'xyz',
        source : {
          url :  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        }
      }
    ]`),
    zoom: NumberControl,
    maxZoom: NumberControl,
    rotation: NumberControl,
    bbox: withDefault(arrayStringExposingStateControl("bbox"),[0,0,0,0]),
    menuTitle: stringSimpleControl(""),
    menuContent: stringSimpleControl(""),
    drawLayer : jsonObjectExposingStateControl("drawLayer",{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"LineString","coordinates":[[514138.9757700867,6865494.523372142],[528910.431486197,6856739.497812072]]},"properties":null}]}),
    trackerLayer : jsonObjectExposingStateControl("trackerLayer"),
    event : jsonObjectExposingStateControl("event"),
    buttons: withDefault(JSONObjectControl,"{menu:false}"),
    features: withDefault(JSONObjectControl,"{draw:false,swipe:false,tracker:false,timeline:false,gpsCentered:true}"),
    onEvent: eventHandlerControl(events),
  };

  //ignoreUpdate function
  const _ignoreUpdate : any = {}
  const setIgnoreUpdate = function(name : string){
    _ignoreUpdate[name]=true
  }
  const ignoreUpdate = function(name : string){
    var ret = _ignoreUpdate[name] || false
    _ignoreUpdate[name] = false
    return ret
  }
   
  return new UICompBuilder(childrenMap, (props: {
    onEvent: any;
    styles: { backgroundColor: any; border: any; radius: any; borderWidth: any; 
              margin: any; padding: any; textSize: any; };
    center : any;
    zoom : number;
    maxZoom: number;
    rotation: number;
    drawLayer: any;
    layers: any;
    bbox: any;
    trackerLayer:any;
    event : any;
    defaults: any;
    buttons: any;
    features: any;
    menuTitle:string;
    menuContent:string;
    autoHeight: boolean;
  }) => {

  //The event handler will also sent the event value to use
  const handleEvent = useCallback((name : string, eventObj : object,notify: any)=>{
    props.event.onChange(Object.assign(props.event.value || {},{
      [name] : eventObj,
      current   : name
    }))
    var n = name.split(":")[0]
    var eventName = "event"
    events.forEach((k)=>{if (k.value==n || k.value==name) {eventName=k.value}})
    switch (eventName){
      case 'draw': 
         setIgnoreUpdate('drawLayer')
         props.drawLayer.onChange(eventObj); 
         break; //Set the drawLayer object
      case 'bbox': 
         props.bbox.onChange(eventObj)
         break;
      //case 'tracker': props.trackerLayer.onChange(eventObj); break; //Set the drawLayer object
    }
    props.onEvent(eventName,eventObj);
    if (props.defaults && props.defaults.debug===true)
       console.log("handleEvent",eventName,props.event.value)
  },[props.onEvent,props.event]);

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
        center={ props.center}
        drawLayer={props.drawLayer.value}
        zoom={props.zoom }
        maxZoom={props.maxZoom}
        rotation={props.rotation}
        height={dimensions.height}
        width={dimensions.width}
        buttons={props.buttons}
        menuContent={props.menuContent}
        menuTitle={props.menuTitle}
        defaults={props.defaults}
        features={props.features}
        layers={props.layers}
        onEvent={handleEvent}
        ignoreUpdate={ignoreUpdate}
      />
    </div>
  );
})
.setPropertyViewFn((children: any) => {
  return (
    <>
      <Section name="Map">
      {children.layers.propertyView({ label: "layers" })}
      {children.drawLayer.propertyView({ label: "drawing" })}
      </Section>
      <Section name="View">
        {children.center.propertyView({ label: "center" })}
        {children.zoom.propertyView({ label: "zoom" })}
        {children.maxZoom.propertyView({ label: "maxZoom" })}
        {children.rotation.propertyView({ label: "rotation" })}
      </Section>
      <Section name="Interaction">
        {children.onEvent.propertyView()}
      </Section>
      <Section name="Behavior">
       {children.features.propertyView({ label: "Enabled features" })}
       {children.buttons.propertyView({ label: "Visible buttons" })}
       {children.menuTitle.propertyView({ label: "Menu title" })}
       {children.menuContent.propertyView({ label: "Menu content" })}
      </Section>
      <Section name="Styles">
      {children.autoHeight.getPropertyView()}
        {children.styles.getPropertyView()}
      </Section>
      <Section name="Advanced">
        {children.defaults.propertyView({ label: "defaults" })}
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

/*
const ModuleCompWithExposingMethods = withMethodExposing(GEOComp, (comp) => {
  return comp.getModuleMethodConfigInfo();
});


export const ModuleComp = withExposingRaw(
  ModuleCompWithExposingMethods,
  (comp) => comp.getOutputDesc(),
  (comp) => {
    if (!comp.isModuleLayoutComp()) {
      return emptyExposing;
    }
    // FIXME: keeps the reference unchanged
    return fromRecord(comp.getOutputNodes());
  }
);
*/

const GEOCompWithMethodExpose = withMethodExposing(GEOComp, [
  {
    method: {
      name: "animate",
      params: [
        {
          name: "point",
          type: "arrayNumberString",
        },
        {
          name: "duration",
          type: "number",
        },
      ],
      description: "Animate towards point ",
    },
    execute: async (comp :any, params :any) => {
      var map = comp.exposingValues.event['map:init']
      animateToLocation(map.getView(),params[0],params?.[1])
    },
  },
  /*
  {
    method: {
      name: "setIn",
      params: [
        {
          name: "path",
          type: "arrayNumberString",
        },
        {
          name: "value",
          type: "JSONValue",
        },
      ],
      description: "",
    },
    execute: async (comp, params) => {
      const { value: prev, onChange } = comp.children.value.getView();
      const [path, value] = params;
      if (
        !Array.isArray(path) ||
        !path.every((i) => typeof i === "string" || typeof i === "number")
      ) {
        throw new Error(trans("temporaryState.pathTypeError"));
      }
      if (!_.isPlainObject(prev) && !Array.isArray(prev)) {
        throw new Error(
          trans("temporaryState.unStructuredError", {
            path: JSON.stringify(path),
            prev: JSON.stringify(prev),
          })
        );
      }
      const nextValue = _.set(_.cloneDeep(prev as JSONObject), path as (string | number)[], value);
      onChange(nextValue);
    },
  },
  */
]);

export default withExposingConfigs(GEOCompWithMethodExpose, [
  new NameConfig("drawLayer", trans("component.drawLayer")),
  new NameConfig("trackerLayer", trans("component.trackerLayer")),
  new NameConfig("event", trans("component.event")),
  new NameConfig("bbox", trans("component.bbox")),
]);
