import { useState, useEffect, useCallback } from 'react';
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
  arrayStringExposingStateControl,
  withMethodExposing,
  AutoHeightControl,
} from "lowcoder-sdk";
import styles from "./styles.module.css";
import { i18nObjs, trans } from "./i18n/comps";
import { Geo } from "./vendors";
import { version } from '../package.json';
import { animate, showPopup, addFeatures, readFeatures, clearFeatures } from './vendors/helpers'
import { useResizeDetector } from "react-resize-detector";
// @ts-ignore
import Notification from 'ol-ext/control/Notification'


export const CompStyles = [
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
    name: "radius",
    label: trans("style.borderRadius"),
    radius: "radius",
  },
  {
    name: "borderWidth",
    label: trans("style.borderWidth"),
    borderWidth: "borderWidth",
  }
] as const;


/**
 * GEOComp Component configuration. 
 * Defines the styling options exposed in the component properties panel.
 * By setting the following items within default you can control behavior
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
        save:false,
        scale:false,
        fullscreen:false,
        layers:false,
        swipeVertical: false,
        swipeHorizontal: false,
        timeline: false,
        center:false,
        tracker :false,
        north: false,
      }
 */
var GEOComp = (function () {

  //The events supported
  const eventDefintions = [
    {
      label: "onDraw",
      value: "draw",
      description: "Triggers when drawLayer data changes",
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
      label: "onClick",
      value: "click",
      description: "Triggers when there is a click within the viewer",
    },
    {
      label: "onSelect",
      value: "click:feature",
      description: "Triggers when there is a click on a feature within the viewer",
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

  //All properties avaiable in component
  const childrenMap = {
    autoHeight: withDefault(AutoHeightControl, "fixed"),
    styles: styleControl(CompStyles),
    defaults: withDefault(
      JSONObjectControl,
      `{
      zoom:10,
      maxZoom:30,
      menuTitle: "Menu",
      menuContent: "No Content",
      buttons: { 
        draw: true
      },
      debug:true
    }`
    ),
    center: ArrayControl,
    layers: withDefault(
      ArrayControl,
      `${JSON.stringify(i18nObjs.defaultData, null, 2)}`
    ),
    zoom: NumberControl,
    maxZoom: NumberControl,
    rotation: NumberControl,
    bbox: arrayStringExposingStateControl("bbox", [0, 0, 0, 0]),
    menuTitle: stringSimpleControl(""),
    menuContent: stringSimpleControl(""),
    events: jsonObjectExposingStateControl("events"),
    event: jsonObjectExposingStateControl("event"),
    feature: jsonObjectExposingStateControl("feature"),
    buttons: withDefault(JSONObjectControl, "{menu:false,north:false,save:false}"),
    features: withDefault(
      JSONObjectControl,
      "{draw:true,swipe:false,tracker:false,timeline:false,gpsCentered:true,largeButtons:false,scaleToBottom:false}"
    ),
    onEvent: eventHandlerControl(eventDefintions),
  };


  //The Builder function creating the real component
  return new UICompBuilder(childrenMap, (props: {
    onEvent: any;
    styles: {
      backgroundColor: any; border: any; radius: any; borderWidth: any;
      padding: any; textSize: any;
    };
    center: any;
    zoom: number;
    maxZoom: number;
    rotation: number;
    layers: any;
    bbox: any;
    defaults: any;
    buttons: any;
    features: any;
    menuTitle: string;
    menuContent: string;
    autoHeight: boolean;
    events: any;
    event: any;
    feature: any
  }) => {
    const doDebug = function () {
      return props.defaults && props.defaults.debug === true
    }
    //Default size of component
    const [dimensions, setDimensions] = useState({ width: 650, height: 400 });
    //Catch the resizing of component
    const { width, height, ref: conRef } = useResizeDetector({
      onResize: () => {
        const container = conRef.current;
        if (!container || !width || !height) return;

        if (props.autoHeight) {
          setDimensions({
            width,
            height: dimensions.height,
          })

          return;
        }

        setDimensions({
          width,
          height: height,
        })
      }
    });

    //Cache for all events
    var _events = {}
    //The event handler will also sent the event value to use
    const handleEvent = function (name: string, eventObj: any) {
      return new Promise((resolve) => {
        //Always create new Event object 
        _events = Object.assign({}, _events, props.events.value, {
          [name]: eventObj,
          current: name
        })

        props.events.onChange(_events)
        props.event.onChange(eventObj || {})
        var n = name.split(":")[0]
        var eventName = "event"
        eventDefintions.forEach((k) => { if (k.value == n || k.value == name) { eventName = k.value } })
        //Double switch will allow fine grained event catching
        switch (name) { //Catch first on name
          case 'map:create':
            return //Internal event only, user should use map:init
          case 'click:feature':
            props.feature.onChange(eventObj)
            break;
          case 'window:resize':
            console.log("P", props.autoHeight)
            if (props.features && props.features.scaleToBottom == true && props.autoHeight) {
              var newHeight = dimensions.height + (eventObj.window.height - eventObj.size.bottom - (props.styles.padding * 2) - 2)
              setDimensions({ width: dimensions.width, height: newHeight })
              eventObj.element.style.height = `${newHeight}px`
            }
            break
          default:
            switch (eventName) {
              case 'bbox':
                props.bbox.onChange(eventObj)
                break;
            }
        }
        //Fire the event to lowcoder
        props.onEvent(eventName, eventObj);
        //Send debug information to console
        if (doDebug())
          console.debug("handleEvent", name, eventObj)
        resolve(_events)
      })
    }

    //Create the container for the component
    return (
      <div className={styles.wrapper}
        style={{
          backgroundColor: `${props.styles.backgroundColor}`,
          borderColor: `${props.styles.border}`,
          borderRadius: `${props.styles.radius}`,
          borderWidth: `${props.styles.borderWidth}`,
          margin: 0,
          padding: `${props.styles.padding}`,
          fontSize: `${props.styles.textSize}`,
          height: '100%',
          width: '100%',
        }}
      >
        <div ref={conRef}
          style={{
            height: '100%',
            width: '100%',
          }}
        >
          <Geo
            height={dimensions.height}
            width={dimensions.width}
            center={props.center}
            zoom={props.zoom}
            maxZoom={props.maxZoom}
            rotation={props.rotation}
            buttons={props.buttons}
            menuContent={props.menuContent}
            menuTitle={props.menuTitle}
            defaults={props.defaults}
            features={props.features}
            layers={props.layers}
            onEvent={handleEvent}
          />
        </div>
      </div>
    );
  })
    //The properties that will be visible inside lowcoder
    .setPropertyViewFn((children: any) => {
      return (
        <>
          <Section name="Map">
            {children.layers.propertyView({ label: "layers" })}
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
            <div style={{ "float": "right", "marginRight": "15px" }}>Version :  {version}</div>
          </div>
        </>
      );
    })
    .build();
})();

//Add autoheight to component
GEOComp = class extends GEOComp {
  autoHeight(): boolean {
    return this.children.autoHeight.getView();
  }
};

/**
 * Exposes methods on GEOComp component to allow calling from parent component.
 * Includes animate, notify, showPopup, addFeatures, and readFeatures methods.
 * 
 * animate: Perform animation on map.
 * notify: Display notification message. 
 * showPopup: Show popup at coordinates with message.
 * addFeatures: Add feature to layer.
 * readFeatures: Read feature from layer.
 */
GEOComp = withMethodExposing(GEOComp, [
  {
    method: {
      name: "animate",
      params: [
        {
          name: "coords",
          type: "JSONValue",
        },
        {
          name: "duration",
          type: "number",
        },
        {
          name: "properties",
          type: "JSON",
        },
        {
          name: "animation",
          type: "string",
        },
      ],
      description: "Perform animation",
    },
    execute: async (comp: any, params: any) => {
      var map = comp.exposingValues.events['map:create']
      animate(map, params[0], params?.[1], params?.[2], params?.[3])
    }
  },
  {
    method: {
      name: "map",
      params: [],
      description: "Return the last map object",
    },
    execute: async (comp: any, params: any) => {
      return comp.exposingValues.events['map:create'] || {}
    }
  },
  {
    method: {
      name: "notify",
      description: "Notify message",
      params: [
        {
          name: "message",
          type: "string",
        },
        {
          name: "duration",
          type: "number",
        }
      ]
    },
    execute: async (comp: any, params: any) => {
      var map = comp.exposingValues.events['map:create']
      map.getControls().forEach((control: any) => {
        if (control instanceof Notification) {
          control.show(params[0], params[1] || 2000)
        }
      })
    }
  },
  {
    method: {
      name: "showPopup",
      description: "Displays a popup at the specified coordinates with a given message",
      params: [
        {
          name: "coordinates",
          type: "JSONValue", // Assuming [longitude, latitude]
          description: "Coordinates where the popup should appear",
        },
        {
          name: "message",
          type: "string",
          description: "Message to display in the popup",
        }
      ]
    },
    execute: async (comp: any, params: any) => {
      var map = comp.exposingValues.events['map:create']
      showPopup(map, params[0], params[1]);
    }
  },
  {
    method: {
      name: "addFeatures",
      description: "Add feature to layer",
      params: [
        {
          name: "data",
          type: "JSONValue",
        },
        {
          name: "layer",
          type: "string",
        },
        {
          name: "clear (optional)",
          type: "boolean",
        }
      ]
    },
    execute: async (comp: any, params: any) => {
      var map = comp.exposingValues.events['map:create']
      return addFeatures(map, params[0], params[1], params[2])
    }
  },
  {
    method: {
      name: "readFeatures",
      description: "Read features from layer",
      params: [
        {
          name: "layer",
          type: "string",
        }
      ]
    },
    execute: async (comp: any, params: any) => {
      var map = comp.exposingValues.events['map:create']
      return readFeatures(map, params[0])
    }
  },
  {
    method: {
      name: "clearFeatures",
      description: "Clear features from layer",
      params: [
        {
          name: "layer",
          type: "string",
        }
      ]
    },
    execute: async (comp: any, params: any) => {
      var map = comp.exposingValues.events['map:create']
      return clearFeatures(map, params[0])
    }
  },
]);


//Expose all methods
export default withExposingConfigs(GEOComp, [
  new NameConfig("events", trans("component.events")),
  new NameConfig("event", trans("component.event")),
  new NameConfig("bbox", trans("component.bbox")),
  new NameConfig("feature", trans("component.feature")),
]);
