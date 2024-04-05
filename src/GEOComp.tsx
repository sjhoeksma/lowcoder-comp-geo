import { useState } from 'react';
import {
  UICompBuilder,
  NameConfig,
  stringSimpleControl,
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
  changeValueAction,
} from "lowcoder-sdk";
import styles from "./styles.module.css";
import { i18nObjs, trans } from "./i18n/comps";
import { Geo } from "./vendors";
import { version } from '../package.json';
import { animate, showPopup, featurePopup, getFeatures, setFeatures, clearFeatures, deepMerge, parseFilter } from './vendors/helpers'
import { useResizeDetector } from "react-resize-detector";
import { featureControl } from './FeaturesControl';
import { geoContext } from './GEOContext';
import { layersControl } from './LayersControl';
// @ts-ignore
import Notification from 'ol-ext/control/Notification'

/**
 * Array of style configuration objects for styling the component.
 * Each object has a name, label, and style property key.
 */
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
 */
var GEOComp = (function () {

  //The events supported
  const eventDefinitions = [
    {
      label: "onModify",
      value: "modify",
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
      description: "Triggers when the map object is created",
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
      label: "onTimeline",
      value: "timeline",
      description: "Triggers when there is a timeline change",
    },
    {
      label: "onZoom",
      value: "map:zoom",
      description: "Triggers when there is zoom change",
    },
    {
      label: "onSave",
      value: "save",
      description: "Triggers when users clicks save button",
    },
    {
      label: "onEvent",
      value: "event",
      description: "Triggers when there is no special event handler is triggered",
    },
  ];

  //All properties available in component
  const childrenMap = {
    autoHeight: withDefault(AutoHeightControl, false),
    styles: styleControl(CompStyles),
    center: ArrayControl,
    layers: layersControl(i18nObjs.defaultData),
    zoom: withDefault(NumberControl, 10),
    maxZoom: withDefault(NumberControl, 30),
    rotation: withDefault(NumberControl, 0),
    projection: stringSimpleControl("EPSG:3857"),
    bbox: arrayStringExposingStateControl("bbox", [0, 0, 0, 0]),
    menuTitle: stringSimpleControl(),
    menuContent: stringSimpleControl(),
    events: jsonObjectExposingStateControl("events"),
    event: jsonObjectExposingStateControl("event"),
    feature: jsonObjectExposingStateControl("feature"),
    onEvent: eventHandlerControl(eventDefinitions),
    startDate: stringSimpleControl(), //TODO replace with date picker
    endDate: stringSimpleControl(),
    features:
      featureControl({
        menu: false,
        zoom: true,
        fullscreen: true,
        layers: true,
        center: true,
        modify: true,
        save: false,
        splitscreen: true,
        tracker: false,
        timeline: false,
        gpsCentered: true,
        north: false,
        scale: true,
        largeButtons: true,
        scaleToBottom: false,
        "modify:move": true,
        "modify:point": true,
        "modify:line": true,
        "modify:oval": true,
        "modify:polygon": true,
        "modify:delete": true,
        "modify:redo": true,
        "modify:undo": true,
        "modify:clear": true,
        "modify:snap": true,
        "splitscreen:horizontal": false,
        "splitscreen:vertical": false,
        debug: geoContext.previewMode,
      }),
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
    feature: any;
    features: any;
    menuTitle: string;
    menuContent: string;
    autoHeight: boolean;
    events: any;
    event: any;
    projection: string;
    startDate: string;
    endDate: string;

    test: any
  }) => {
    //Default size of component
    const [dimensions, setDimensions] = useState({ width: 650, height: 460 });
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


    //Check if feature is Enabled
    const featureEnabled = function (name: any) {
      return props.features[name] == true
    }

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
        eventDefinitions.forEach((k) => { if (k.value == n || k.value == name) { eventName = k.value } })
        //Double switch will allow fine grained event catching
        switch (name) { //Catch first on name
          case 'map:rebuild':
            props.events.onChange({})
            props.event.onChange({})
            props.feature.onChange({})
            _events = {}
            break;
          case 'click:feature':
            props.feature.onChange(eventObj)
            break;
          case 'window:resize':
            if (featureEnabled('scaleToBottom') && props.autoHeight) {
              const pads = props.styles.padding.split(' ');
              const bottom = (parseFloat(pads[pads.length == 4 ? 3 : 0].replace("px", "")) * 2) + 2
              var newHeight = dimensions.height + (eventObj.windowSize.height - eventObj.bounds.bottom - bottom)
              eventObj.element.style.height = `${newHeight}px`
              setDimensions({ width: dimensions.width, height: newHeight })
              if (featureEnabled("debug"))
                console.debug("Resized done", newHeight)
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
        if (featureEnabled('debug'))
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
            menuContent={props.menuContent}
            menuTitle={props.menuTitle}
            layers={props.layers.data}
            onEvent={handleEvent}
            features={props.features}
            projection={props.projection}
            startDate={props.startDate}
            endDate={props.endDate}
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
            {children.layers.propertyView({ title: "layers" })}
            {children.center.propertyView({ label: "center" })}
            {children.zoom.propertyView({ label: "zoom" })}
            {children.maxZoom.propertyView({ label: "maxZoom" })}
            {children.rotation.propertyView({ label: "rotation" })}
            {children.projection.propertyView({ label: "projection" })}
          </Section>
          <Section name="Interaction">
            {children.onEvent.propertyView()}
          </Section>
          <Section name="Menu">
            {children.menuTitle.propertyView({ label: "Title" })}
            {children.menuContent.propertyView({ label: "Content" })}
          </Section>
          <Section name="Timeline">
            {children.startDate.propertyView({ label: "Start Date" })}
            {children.endDate.propertyView({ label: "End Date" })}
          </Section>
          <Section name="Styles">
            {children.autoHeight.getPropertyView()}
            {children.styles.getPropertyView()}
          </Section>
          <Section name="Behavior" open="false">
            {children.features.propertyView({ title: trans("features.title") })}
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
      var map = comp.exposingValues.events['map:init']
      if (map) animate(map, params[0], params?.[1], params?.[2], params?.[3])
    }
  },
  {
    method: {
      name: "map",
      params: [],
      description: "Return the last map object",
    },
    execute: async (comp: any, params: any) => {
      return comp.exposingValues.events['map:init'] || {}
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
      var map = comp.exposingValues.events['map:init']
      if (map) map.getControls().forEach((control: any) => {
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
          name: "coordinates/featureEvent",
          type: "JSONValue", // Assuming [longitude, latitude] can also be an featureEvent
          description: "Coordinates or featureEvent object where the popup should appear",
        },
        {
          name: "message",
          type: "string",
          description: "Message to display in the popup",
        },
        {
          name: "style",
          type: "string",
          description: "Style of popup (optional)",
        },
      ]
    },
    execute: async (comp: any, params: any) => {
      var map = comp.exposingValues.events['map:init']
      if (map) {
        switch (params[2]) {
          case 'features':
            featurePopup(map, params[0], params[1])
            break;
          default:
            showPopup(map, params[0], params[1]);
        }
      }
    }
  },
  {
    method: {
      name: "setFeatures",
      description: "Add feature to layer",
      params: [
        {
          name: "layer",
          type: "string",
        },
        {
          name: "data",
          type: "JSONValue",
        },
        {
          name: "clear",
          type: "boolean",
        }
      ]
    },
    execute: async (comp: any, params: any) => {
      var map = comp.exposingValues.events['map:init']
      if (map) setFeatures(map, params[0], params[1], params[2] == true)
    }
  },
  {
    method: {
      name: "getFeatures",
      description: "Get features from layer",
      params: [
        {
          name: "layer",
          type: "string",
        }
      ]
    },
    execute: async (comp: any, params: any) => {
      var map = comp.exposingValues.events['map:init']
      if (map) return getFeatures(map, params[0])
      throw Error('Map not ready')
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
      var map = comp.exposingValues.events['map:init']
      if (map) return clearFeatures(map, params[0])
      return false
    }
  },
  {
    method: {
      name: "setConfig",
      description: "Set configuration the plugin by json",
      params: [
        {
          name: "json",
          type: "JSONValue",
        },
        {
          name: "filter",
          type: "JSONValue",
        },
      ]
    },
    execute: async (comp: any, params: any) => {
      if (params.length == 0) return
      //Create filter based on param
      const filter = parseFilter(params[1])
      try {
        var data = params[0]
        if (typeof data === 'string' || data instanceof String) {
          // @ts-ignore
          data = JSON.parse(data)
        }
        //Filter out data not needed
        if (filter.length != 0) {
          for (const [key, value] of Object.entries(data)) {
            if (!filter.includes(key)) {
              delete data[key]
            }
          }
        }
        //Load the new values by dispatching them, 
        //First merging the current values with the new values
        comp.dispatch(changeValueAction(deepMerge(comp.toJsonValue(), data), true))
        return true
      } catch (e) {
        console.error("Failed to parse config data", e)
        return false
      }
    }
  },
  {
    method: {
      name: "getConfig",
      description: "Get configuration the plugin by json",
      params: [
        {
          name: "filter",
          type: "JSONValue",
        },
        {
          name: "asString",
          type: "boolean",
        },
      ]
    },
    execute: async (comp: any, params: any) => {
      //Create filter based on param
      const filter = parseFilter(params[0])
      //Get the json config data
      var data = comp.toJsonValue();
      //Filter out data not needed
      if (filter.length != 0) {
        for (const [key, value] of Object.entries(data)) {
          if (!filter.includes(key)) {
            delete data[key]
          }
        }
      }
      //Should we convert the data into string
      data = params[1] !== true ? data : JSON.stringify(data, null)
      if (geoContext.previewMode)
        console.debug(data)
      //Event config needs to be added
      return data
    }
  },
  {
    method: {
      name: "getZoom",
      description: "Get current zoom position of map",
      params: []
    }, execute: async (comp: any, params: any) => {
      var map = comp.exposingValues.events['map:init']
      if (map) return map.getView().getZoom()
      return 0
    }
  }
]);


//Expose all methods
export default withExposingConfigs(GEOComp, [
  new NameConfig("events", trans("component.events")),
  new NameConfig("event", trans("component.event")),
  new NameConfig("bbox", trans("component.bbox")),
  new NameConfig("feature", trans("component.feature")),
]);
