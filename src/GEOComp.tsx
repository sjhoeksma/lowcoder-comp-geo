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
import { trans } from "./i18n/comps";
import { Geo } from "./vendors";
import { version } from '../package.json';
import { animate } from './vendors/helpers/Animate'
import { showPopup } from "./vendors/helpers/Popup";
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
 */
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
  const childrenMap = {
    autoHeight: withDefault(AutoHeightControl, "fixed"),
    styles: styleControl(CompStyles),
    defaults: withDefault(JSONObjectControl, `{
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
    layers: withDefault(ArrayControl, `[
      {
        type : 'xyz',
        name: 'OpenStreetMap',
        source : {
          url :  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        }
      }
    ]`),
    zoom: NumberControl,
    maxZoom: NumberControl,
    rotation: NumberControl,
    bbox: arrayStringExposingStateControl("bbox", [0, 0, 0, 0]),
    menuTitle: stringSimpleControl(""),
    menuContent: stringSimpleControl(""),
    drawLayer: jsonObjectExposingStateControl("drawLayer", { "type": "FeatureCollection", "features": [{ "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[514138.9757700867, 6865494.523372142], [528910.431486197, 6856739.497812072]] }, "properties": null }] }),
    trackerLayer: jsonObjectExposingStateControl("trackerLayer"),
    event: jsonObjectExposingStateControl("event"),
    map: jsonObjectExposingStateControl("map"),
    buttons: withDefault(JSONObjectControl, "{menu:false}"),
    features: withDefault(JSONObjectControl, "{draw:true,swipe:false,tracker:false,timeline:false,gpsCentered:true,largeButtons:false}"),
    onEvent: eventHandlerControl(events),
  };

  //ignoreUpdate function
  const _ignoreUpdate: any = {}
  const setIgnoreUpdate = function (name: string) {
    _ignoreUpdate[name] = true
  }
  const ignoreUpdate = function (name: string) {
    var ret = _ignoreUpdate[name] || false
    _ignoreUpdate[name] = false
    return ret
  }

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
    drawLayer: any;
    layers: any;
    bbox: any;
    trackerLayer: any;
    defaults: any;
    buttons: any;
    features: any;
    menuTitle: string;
    menuContent: string;
    autoHeight: boolean;
    event: any;
    map: any;
  }) => {
    const [dimensions, setDimensions] = useState({ width: 650, height: 400 });
    //The event handler will also sent the event value to use
    const handleEvent = useCallback((name: string, eventObj: any) => {
      props.event.onChange(Object.assign(props.event.value || {}, {
        [name]: eventObj,
        current: name
      }))
      var n = name.split(":")[0]
      var eventName = "event"
      events.forEach((k) => { if (k.value == n || k.value == name) { eventName = k.value } })
      switch (name) { //Catch first on name
        case 'map:create':
          props.map.onChange(eventObj)
          return //Internal event only, user should use map:init
        default:
          switch (eventName) {
            case 'draw':
              setIgnoreUpdate('drawLayer')
              props.drawLayer.onChange(eventObj);
              break; //Set the drawLayer object
            case 'bbox':
              props.bbox.onChange(eventObj)
              break;
          }
        //case 'tracker': props.trackerLayer.onChange(eventObj); break; //Set the drawLayer object
      }
      props.onEvent(eventName, eventObj);
      if (props.defaults && props.defaults.debug === true)
        console.log("handleEvent", eventName, eventObj)
    }, [props.onEvent]);

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
            drawLayer={props.drawLayer.value}
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
            ignoreUpdate={ignoreUpdate}
          />
        </div>
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
            <div style={{ "float": "right", "marginRight": "15px" }}>Version :  {version}</div>
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

/**
 * Exposes methods on GEOComp component to allow calling from parent component.
 * Includes:
 * - animate: Perform animation on map
 * - map: Get OpenLayers map instance 
 * - notify: Display notification message
 * - showPopup: Show popup at coordinates with message
*/
/**
 * Exposes methods on GEOComp component to allow calling from parent component.
 * Includes:
 * - animate: Perform animation on map 
 * - map: Get OpenLayers map instance  
 * - notify: Display notification message
 * - showPopup: Show popup at coordinates with message
*/
const GEOCompWithMethodExpose = withMethodExposing(GEOComp, [
  {
    method: {
      name: "animate",
      params: [
        {
          name: "coords",
          type: "array",
        },
        {
          name: "duration",
          type: "number",
        },
        {
          name: "properties",
          type: "JSONValue",
        },
        {
          name: "animation",
          type: "string",
        },
      ],
      description: "Perform animation",
    },
    execute: async (comp: any, params: any) => {
      animate(params?.[3], comp.exposingValues.map.getView(), params[0], params?.[1], params?.[2])
    },
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
      comp.exposingValues.map.getControls().forEach((control: any) => {
        if (control instanceof Notification) {
          control.show(params[0], params[1] || 2000)
        }
      })
    },
  },
  {
    method: {
      name: "showPopup",
      description: "Displays a popup at the specified coordinates with a given message",
      params: [
        {
          name: "coordinates",
          type: "array", // Assuming [longitude, latitude]
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
      showPopup(comp.exposingValues.map, params[0], params[1]);
    },
  }
]);

export default withExposingConfigs(GEOCompWithMethodExpose, [
  new NameConfig("drawLayer", trans("component.drawLayer")),
  new NameConfig("trackerLayer", trans("component.trackerLayer")),
  new NameConfig("event", trans("component.event")),
  new NameConfig("bbox", trans("component.bbox")),
  new NameConfig("map", "map"),
]);
