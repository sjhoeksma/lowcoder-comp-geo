//CSS
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import "@fortawesome/fontawesome-free/css/all.css"
import "./styles.css";

import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types'
//React spinner
import { RingLoader } from 'react-spinners'

//The real GEO OpenLayers packages
import { Map, View } from 'ol/index';
import { Vector as VectorLayer, Group as LayerGroup } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { LineString, Polygon } from 'ol/geom';
import { fromLonLat, transformExtent } from 'ol/proj';
import { FullScreen, Zoom } from 'ol/control';
import { Draw, Snap, Select } from 'ol/interaction'

//Openlayer Extend imports
import GeolocationBar from 'ol-ext/control/GeolocationBar'
import CanvasScaleLine from 'ol-ext/control/CanvasScaleLine'
import Notification from 'ol-ext/control/Notification'
import Bar from 'ol-ext/control/Bar'
import Button from 'ol-ext/control/Button'
import Toggle from 'ol-ext/control/Toggle'
import Overlay from 'ol-ext/control/Overlay'
import Timeline from 'ol-ext/control/Timeline'
import Swipe from 'ol-ext/control/Swipe'
import UndoRedo from 'ol-ext/interaction/UndoRedo'
import ModifyFeature from 'ol-ext/interaction/ModifyFeature'
import LayerSwitcher from 'ol-ext/control/LayerSwitcher'

///Local import
import RotateNorthControl from './RotateNorthControl'
import { createLayer } from './helpers/Layers'
import { animate, geoJsonStyleFunction, useScreenSize } from './helpers'

//WorkArround, undo needs getSource
class LayerGroupUndo extends LayerGroup {
  getSource() { return null }
}

const defMinDate = '1900'

function Geo(props) {
  const [geoRef, setGeoRef] = useState();
  const [geoLoc, setGeoLoc] = useState([0, 0]);
  const [map, setMap] = useState();
  const [geoId] = useState(Math.random().toString(16).slice(2));

  //Global notification item
  const [notification] = useState(new Notification({}))
  // Vector layer for drawing
  const [drawVector] = useState(new VectorLayer({
    name: 'draw',
    title: "Drawing",
    source: new VectorSource(),
    style: geoJsonStyleFunction
  }))
  // Vector layer for the tracker
  const [trackerVector] = useState(new VectorLayer({
    name: 'tracker',
    source: new VectorSource(),
  }))


  //Function to check if updating of a variable is allowed
  const featureEnabled = function (name) {
    return props.features[name] == true
  }

  //Fire and event to controling ReactComponent
  const fireEvent = function (name, eventObject) {
    if (props.onEvent) {
      props.onEvent(name, eventObject || {})
    }
  }

  //Fetch the geolocation based on browser or ip when center is not set
  const elementRef = useCallback(ref => {
    setGeoRef(ref);
  }, []);

  const centerMe = function (noSet = false) {
    return new Promise((resolve, reject) => {
      fireEvent("geoloc:search")
      navigator.geolocation.getCurrentPosition(
        (success) => {
          const coords = [success.coords.longitude, success.coords.latitude]
          if (!noSet) setGeoLoc(coords)
          fireEvent("geoloc:navigator", coords)
          resolve(coords)
        },
        (error) => {
          fetch('https://ipapi.co/json/')
            .then(function (response) {
              if (response.ok) {
                response.json().then(function (data) {
                  const coords = [data.longitude, data.latitude]
                  if (!noSet) setGeoLoc(coords)
                  fireEvent("geoloc:ip", coords)
                })
              } else {
                reject(response)
              }

            }).catch((e) => {
              fireEvent("geoloc:failure", e)
              reject(e)
            })
        },
        { maximumAge: 60000 * 5, timeout: 5000, enableHighAccuracy: true });
    })
  }

  const loadLayers = function (map) {
    if (map) {
      //Remove the current layers
      map.getLayers().clear();
      const sortFn = function (a, b) {
        const av = (a.get('order') || 0)
        const bv = (b.get('order') || 0)
        if (av < bv) {
          return -1;
        } else if (av > bv) {
          return 1;
        }
        return 0;
      }
      console.log("Layers", props.layers, typeof props.layers, (Array.isArray(props.layers) ? props.layers : []))
      const layers = (Array.isArray(props.layers) ? props.layers : [])
        .map(layerConfig => createLayer(layerConfig, map))
        .filter(layer => layer !== null && layer !== undefined)
        .sort(sortFn);
      var workinglayers = [...layers]
      //Sort all layers an groups and add them to map
      const layerGroups = {}
      layers.forEach((layer, idx) => {
        if (layer) {
          if (layer.get('timeline')) {
            layer.setVisible(false) //Timelines is always invisable
            g = "timeline"
            layerGroups[g] = layerGroups[g] ? [...layerGroups[g], layer] : [layer]
            //Remove the layer from working layers
            const index = workinglayers.indexOf(layer);
            if (index >= 0) workinglayers.splice(index, 1);
          } else if (layer.get('groups')) {
            const groups = layer.get('groups')
            const gr = Array.isArray(groups) ? groups : [groups]
            gr.forEach((g) => {
              layerGroups[g] = layerGroups[g] ? [...layerGroups[g], layer] : [layer]
              //Remove the layer from working layers
              const index = workinglayers.indexOf(layer);
              if (index >= 0) workinglayers.splice(index, 1);
            })
          }
        }
      });
      //Convert layerGroups into LayerGroups
      for (const [key, value] of Object.entries(layerGroups)) {
        workinglayers.push(new LayerGroupUndo({
          name: key,
          title: key.charAt(0).toUpperCase() + key.slice(1),
          layers: value,
          order: Math.min(...value.map(item => { return item.get('order') || 999999 })),
          displayInLayerSwitcher: key !== "timeline"
        }))
      }
      //Sort the working layer
      workinglayers.sort(sortFn);
      workinglayers.forEach(layer => {
        map.addLayer(layer)
      })

      //TrackerVector
      if (featureEnabled('tracker')) {
        map.addLayer(trackerVector)
      }
      //Add drawLayer and values if set
      if (featureEnabled('modify')) {
        map.addLayer(drawVector)
      }
      fireEvent("map:layers", layers)
    }
  }

  //Configuration of Map component, changing watch props will rebuild map object
  useEffect(() => {
    if (geoRef) {
      geoRef.innerHTML = "<div id='GEO_" + geoId + "' " + (featureEnabled('largeButtons') ? "class='ol-large'" : "") +
        "  style='height:100%;width:100%'></div>"

      //The real map object
      var olMap = new Map({
        controls: [],
        view: new View({
          center: fromLonLat(props.center.length == 2 ? props.center : geoLoc),
          zoom: props.zoom,
          maxZoom: props.maxZoom,
          rotation: props.rotation,
          projection: props.projection
        }),
        target: 'GEO_' + geoId,
        layers: [],
      });
      fireEvent('map:create', olMap);

      //Add the buttons contols
      var zoom = new Zoom({
        className: 'ol-zoom',
        zoomInLabel: '+',
        zoomOutLabel: '-'
      })
      if (!featureEnabled('menu')) zoom.element.classList.add('nomenu')
      if (featureEnabled('zoom')) olMap.addControl(zoom)

      //Main menubar
      var mainbar = new Bar({ className: "mainbar" });
      mainbar.setPosition("top-left")
      if (!featureEnabled('menu')) mainbar.element.classList.add('nomenu')
      if ((featureEnabled('modify')
        && (featureEnabled('modify:move') || featureEnabled('modify:point') || featureEnabled('modify:line')
          || featureEnabled('modify:polygon') || featureEnabled('modify:undo') || featureEnabled('modify:redo')
          || featureEnabled('modify:delete')))
        || featureEnabled('save')
        || featureEnabled('center'))
        olMap.addControl(mainbar);

      //GeoLocation
      var geoLocation = new Button({
        html: '<i class="fa fa-crosshairs"></i>',
        title: "Center",
        handleClick: function (e) {
          centerMe(true).then((coords) => {
            animate(olMap, coords, 3000, { zoom: 16, _locDuration: 2000, _pulseCount: 6, _easing: 'bounce' }, "home")
          })
          notification.show("Searching GPS", 3000)
        }
      })
      if (featureEnabled('center')) mainbar.addControl(geoLocation)


      if (featureEnabled('modify')) {
        // Edit control bar 
        var editbar = new Bar({
          toggleOne: true,	// one control active at the same time
          group: false			// group controls together
        });
        if (featureEnabled('modify:move') || featureEnabled('modify:point') || featureEnabled('modify:line')
          || featureEnabled('modify:polygon') || featureEnabled('modify:undo') || featureEnabled('modify:redo')
          || featureEnabled('modify:delete'))
          mainbar.addControl(editbar);

        //Add modify interaction
        const modify = new ModifyFeature({ source: drawVector.getSource() });
        const snap = new Snap({ source: drawVector.getSource() });
        // Add move tools
        var pmove = new Toggle({
          html: '<i class="fa fa-up-down-left-right" ></i>',
          title: 'Move',
          onToggle: (active) => {
            olMap.removeInteraction(snap);
            olMap.removeInteraction(modify);
            if (active) {
              olMap.addInteraction(modify);
              olMap.addInteraction(snap);
            }
          }
        });
        pmove.on('change:disable', function () {
          olMap.removeInteraction(snap);
          olMap.removeInteraction(modify);
        })
        if (featureEnabled('modify:move')) editbar.addControl(pmove);

        // Add editing tools
        var pedit = new Toggle({
          html: '<i class="fa fa-map-marker" ></i>',
          title: 'Point',
          onToggle: (active) => {
            olMap.removeInteraction(snap);
            olMap.removeInteraction(modify);
          },
          interaction: new Draw({
            type: 'Point',
            source: drawVector.getSource(),
          })
        });
        if (featureEnabled('modify:point')) editbar.addControl(pedit);

        var ledit = new Toggle({
          html: '<i class="fa fa-share-alt" ></i>',
          title: 'Line',
          onToggle: (active) => {
            olMap.removeInteraction(snap);
            olMap.removeInteraction(modify);
          },
          interaction: new Draw({
            type: 'LineString',
            source: drawVector.getSource(),
            // Count inserted points
            geometryFunction: function (coordinates, geometry) {
              if (geometry) geometry.setCoordinates(coordinates);
              else geometry = new LineString(coordinates);
              this.nbpts = geometry.getCoordinates().length;
              return geometry;
            }
          })
        });
        if (featureEnabled('modify:line')) editbar.addControl(ledit);

        var fedit = new Toggle({
          html: '<i class="fa fa-bookmark fa-rotate-270" ></i>',
          title: 'Polygon',
          onToggle: (active) => {
            olMap.removeInteraction(snap);
            olMap.removeInteraction(modify);
          },
          interaction: new Draw({
            type: 'Polygon',
            //style: [lightStroke, darkStroke],
            source: drawVector.getSource(),
            // Count inserted points
            geometryFunction: function (coordinates, geometry) {
              //this.nbpts = coordinates[0].length;
              if (geometry) geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])]);
              else geometry = new Polygon(coordinates);
              return geometry;
            }
          })
        });
        if (featureEnabled('modify:polygon')) editbar.addControl(fedit);

        //DELETE editing tools
        var pSelect = new Select({ source: drawVector.getSource() });
        pSelect.on('select', (event) => {
          event.selected.forEach((f) => { drawVector.getSource().removeFeature(f) })
        })
        var pdelete = new Toggle({
          html: '<i class="fa fa-trash-can" ></i>',
          title: 'Delete',
          interaction: pSelect,
          onToggle: (active) => {
            olMap.removeInteraction(snap);
            olMap.removeInteraction(modify);
            if (active) {
              olMap.addInteraction(snap);
            }
          }
        });
        if (featureEnabled('modify:delete')) editbar.addControl(pdelete);

        // Undo redo interaction
        var undoInteraction = new UndoRedo({ layers: [drawVector] });
        undoInteraction.on('stack:add', function (e) {
          fireEvent("modify:add")
        })
        undoInteraction.on('stack:remove', function (e) {
          fireEvent("modify:remove")
        })
        olMap.addInteraction(undoInteraction);

        // Add a simple push button to undo features
        var undo = new Button({
          html: '<i class="fa fa-undo"></i>',
          title: "Undo",
          handleClick: function (e) {
            undoInteraction.undo();
          }
        });
        if (featureEnabled('modify:undo')) mainbar.addControl(undo);

        // Add a simple push button to redo features
        var redo = new Button({
          html: '<i class="fa fa-redo"></i>',
          title: "Redo",
          handleClick: function (e) {
            undoInteraction.redo();
          }
        });
        if (featureEnabled('modify:redo')) mainbar.addControl(redo);
      }

      // Add a simple push button to save features
      var save = new Button({
        html: '<i class="fa fa-download"></i>',
        title: "Save",
        handleClick: function (e) {
          fireEvent("save")
        }
      });
      if (featureEnabled("save")) mainbar.addControl(save);

      //Fullscreen
      var fullscreen = new FullScreen()
      if (featureEnabled('fullscreen')) olMap.addControl(fullscreen)

      var secondbar = new Bar({ className: "ol-secondbar" });
      secondbar.setPosition("top-right")
      if ((featureEnabled('splitscreen') && (featureEnabled('splitscreen:horizontal') || featureEnabled('splitscreen:vertical')))
        || (featureEnabled('timeline') && featureEnabled('timeline')))
        olMap.addControl(secondbar);

      // Add a simple push button to save features
      // Add control inside the map
      var layerCtrl = new LayerSwitcher({
        // collapsed: false,
        // mouseover: true
      });
      if (featureEnabled('layers')) olMap.addControl(layerCtrl);

      // Swipe control bar 
      if (featureEnabled('splitscreen')) {
        // Swipe control bar 
        var swipebar = new Bar({
          toggleOne: true,	// one control active at the same time
          group: false			// group controls together
        });
        if (featureEnabled('splitscreen:vertical') || featureEnabled('splitscreen:horizontal'))
          secondbar.addControl(swipebar);

        var swipectrl = new Swipe({});
        //Todo Add the layers for the swipe control

        const findSplits = function (layers) {
          layers.forEach((layer) => {
            if (layer.get("splitscreen") == "left" && layer.isVisible()) {
              swipectrl.addLayer(layer, false);
            } else if (layer.get("splitscreen") == "right" && layer.isVisible()) {
              swipectrl.addLayer(layer, true);
            } else if (layer instanceof LayerGroup) {
              findSplits(layer.getLayers())
            }
          })
        }

        var swipeHorz = new Toggle({
          html: '<i class="fa fa-grip-lines-vertical fa-rotate-90"></i>',
          title: "Splitscreen Horizontal",
          onToggle: function (active) {
            if (active) {
              olMap.addControl(swipectrl)
              swipectrl.set('orientation', 'horizontal')
              swipectrl.set('position', 0.5)
              swipectrl.removeLayers();
              findSplits(olMap.getLayers())
            } else {
              olMap.removeControl(swipectrl)
            }
            fireEvent("splitsceen:horizontal", active)
          }
        });
        if (featureEnabled('splitscreen:horizontal')) swipebar.addControl(swipeHorz);

        var swipeVert = new Toggle({
          html: '<i class="fa fa-grip-lines-vertical "></i>',
          title: "Splitscreen Vertical",
          onToggle: function (active) {
            if (active) {
              olMap.addControl(swipectrl)
              swipectrl.set('orientation', 'vertical')
              swipectrl.set('position', 0.5)
              swipectrl.removeLayers();
              findSplits(olMap.getLayers())
            } else {
              olMap.removeControl(swipectrl)
            }
            fireEvent("splitscreen:vertical", active)
          }
        });
        if (featureEnabled('splitscreen:vertical')) swipebar.addControl(swipeVert);
      }

      // Menu Overlay
      var menu = new Overlay({
        closeBox: true,
        className: "slide-left menu",
        content: `<div id="menuTitle" ><h1 id="menuTitle_` + geoId + `">${props.menuTitle.trim() || "&nbsp;"}</h1></div>
        <div id="menuContent_`+ geoId + `">${props.menuContent}</div>`
      });
      if (!featureEnabled('menu')) menu.element.classList.add('nomenu')
      olMap.addControl(menu);

      // A toggle control to show/hide the menu
      var toggle = new Toggle({
        className: 'ol-menu',
        html: '<i class="fa fa-bars" ></i>',
        title: "Menu",
        onToggle: function (active) {
          menu.toggle();
          fireEvent("toggle:menu", active)
        }
      });
      if (featureEnabled('menu')) olMap.addControl(toggle);

      if (featureEnabled('timeline')) {
        //Timeline
        var tline = new Timeline({
          className: 'ol-pointer ol-zoomhover ol-timeline',
          features: [],
          minDate: new Date(props.startDate || defMinDate),
          maxDate: new Date(props.endDate),
          getFeatureDate: function (l) { return l.get("timeline") },
          getHTML: function (l) { return l.get("timeline") }
        });

        var histo = []
        tline.on('scroll', function (e) {
          var layer, dmin = Infinity;
          histo.forEach(function (l, i) {
            var d = new Date(l.get("timeline"));
            var dt = Math.abs(e.date - d);
            if (dt < dmin) {
              layer = l;
              dmin = dt;
            }
            if (i !== 0) l.setVisible(false);
          });
          if (layer) {
            layer.setVisible(true);
          }
          fireEvent("timeline:scroll", e)
        });
        tline.on('select', function (e) {
          tline.setDate(e.feature);
          fireEvent("timeline:select", e)
        });


        var timeline = new Toggle({
          html: '<i class="fa fa-clock"></i>',
          title: "Timeline",
          onToggle: function (active) {
            fireEvent("toggle:timeline", active)
          }
        });
        if (featureEnabled('timeline')) secondbar.addControl(timeline);
        //Toggle the timeline classes
        timeline.on("change:active", (event) => {
          if (event.active) {
            //From layers get all histroy
            function fillTimeline(layers) {
              layers.forEach((layer) => {
                console.log(layer)
                if (layer instanceof LayerGroup) {
                  fillTimeline(layer.getLayers())
                } else if (layer.get("groups") && timelineDate(layer) && (
                  (Array.isArray(layer.get("groups")) && layer.get("groups").includes('timeline')) ||
                  (typeof layer.get("groups") === "string" && layer.get("groups") == 'timeline'))) {
                  histo.push[layer]
                }
              })
            }
            fillTimeline(olMap.getLayers())
            tline.setFeatures(histo)

            scaleLineControl.element.classList.add('timeline')
            geoTracker.element.classList.add('timeline')
            geoLocation.element.classList.add('timeline')
            olMap.addControl(tline);
            fireEvent('timeline:state', true)
          } else {
            scaleLineControl.element.classList.remove('timeline')
            geoTracker.element.classList.remove('timeline')
            geoLocation.element.classList.remove('timeline')
            olMap.removeControl(tline);
            //Work arround voor scaleLineControl not moving
            olMap.removeControl(scaleLineControl);
            olMap.addControl(scaleLineControl);
            fireEvent('timeline:state', false)
          }
        });
      }

      //Add a GeoTracker
      var geoTracker = new GeolocationBar({
        source: trackerVector.getSource(),
        delay: 5000,
        followTrack: 'auto',
        minZoom: 16,
        minAccuracy: 10000
      });
      if (featureEnabled('tracker') && featureEnabled('tracker'))
        olMap.addControl(geoTracker)

      //rotateNorth control
      var rotateNorth = new RotateNorthControl();
      if (featureEnabled('north')) mainbar.addControl(rotateNorth);

      // CanvasScaleLine control
      var scaleLineControl = new CanvasScaleLine();
      if (featureEnabled('scale')) olMap.addControl(scaleLineControl);

      //Handling Events
      const singleClick = function (evt) {
        var _feature = false;
        olMap.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
          // Vector feature click logic
          if (!(featureEnabled('modify') &&
            (pdelete.getActive() || pmove.getActive() ||
              pedit.getActive() || ledit.getActive() || fedit.getActive()))
            && layer && layer.get("selectable") !== false && feature) { //only fire event if we are not drawing
            fireEvent('click:feature', {
              extent: transformExtent(feature.getGeometry()?.extent_, olMap.getView().getProjection(), 'EPSG:4326') || [],
              properties: feature.getProperties() || {},
              layer: layer.get("name")
            })
            _feature = true;
            return true; // Stop iterating through features
          }

        });

        //Fire the click event only if not feature
        if (!_feature) fireEvent('click:single', evt)
      }
      // Click event listener for vector features and WMS GetFeatureInfo
      olMap.on('singleclick', singleClick);

      // Optional: pointer move logic for changing cursor over WMS layers
      olMap.on('pointermove', function (evt) {
        if (evt.dragging) return; // skip if the map is being dragged

        var cursorStyle = 'default'; // Default cursor style
        const pixel = olMap.getEventPixel(evt.originalEvent);

        // Check for features at the current pointer position
        olMap.forEachFeatureAtPixel(pixel, function (feature, layer) {
          // If a layer is found and its selectable property is not false
          if (layer && layer.get('selectable') !== false) {
            cursorStyle = 'pointer'; // Change the cursor to pointer
            return true; // Stop iterating through the features
          }
        });

        // Apply the determined cursor style to the map target element
        olMap.getTargetElement().style.cursor = cursorStyle;
      });


      //Handle the loaded event
      olMap.on('loadend', function (event) {
        fireEvent('map:loaded', event)
      });

      //Handle zoom event
      /*
      olMap.getView().on('change:resolution', (event) => {
        fireEvent('map:zoom',Object.assign({},event,{newValue: olMap.getView().getResolution()}))
      });
      */

      //On move
      olMap.on('moveend', () => {
        const extent = olMap.getView().calculateExtent(olMap.getSize()); // Get the current extent
        const transformedExtent = transformExtent(extent, olMap.getView().getProjection(), 'EPSG:4326'); // Transform the extent to WGS 84
        fireEvent('bbox:change', transformedExtent); // Call the callback with the updated bbox
      }
      );

      // Notification Control
      olMap.addControl(notification);

      //Add map init event
      fireEvent('map:init', olMap);

      setMap(olMap)
    }
  }, [geoRef, props.features, props.projection, props.startDate, props.endDate]);


  useEffect(() => {
    if (map) {
      geoRef.style.height = `${props.height}px`;
    }
  }, [props.height, props.width])

  //Zoom handling
  useEffect(() => {
    if (map) {
      map.getView().setZoom(Math.min(props.zoom, props.maxZoom))
    }
  }, [props.zoom]);

  //Max zoom handling
  useEffect(() => {
    if (map) {
      map.getView().setMaxZoom(props.maxZoom)
      map.getView().setZoom(Math.min(props.zoom, props.maxZoom))
    }
  }, [props.maxZoom]);


  //rotation handling
  useEffect(() => {
    if (map) {
      map.getView().setRotation(props.rotation)
    }
  }, [props.rotation]);

  //Center the location on map
  useEffect(() => {
    if (map) {
      if (props.center && props.center.length == 2)
        map.getView().setCenter(fromLonLat(props.center))
      else if (geoLoc) {
        map.getView().setCenter(fromLonLat(geoLoc))
      }
    }
  }, [props.center, geoLoc]);
  //Menu title
  useEffect(() => {
    if (map) {
      var el = document.getElementById('menuTitle_' + geoId)
      if (el) el.innerHTML = (props.menuTitle.trim() || "&nbsp;")
    }
  }, [props.menuTitle]);
  //Menu content
  useEffect(() => {
    if (map) {
      var el = document.getElementById('menuContent_' + geoId)
      if (el) el.innerHTML = props.menuContent
    }
  }, [props.menuContent]);

  // Dynamic layer updating
  useEffect(() => {
    if (map)
      loadLayers(map)
  }, [map, props.layers, props.features.modify, props.features.tracker]); // Re-evaluate when layers change

  //GPS location
  useEffect(() => {
    if (featureEnabled('gpsCentered')) {
      centerMe()
    }
  }, [props.features.gpsCentered]);


  var windowSize = useScreenSize()
  useEffect(() => {
    var el = document.getElementById('GEO.' + geoId)
    if (el) {
      fireEvent('window:resize', { element: el, windowSize: windowSize, bounds: el.getBoundingClientRect() })
    }
  }, [elementRef, windowSize])


  return (
    <div
      ref={elementRef}
      id={"GEO." + geoId}
      style={{ height: props.height, width: props.width }}
    >
      <RingLoader color="#36d7b7"
        style={{ position: 'absolute', top: '45%', left: '48%', transform: 'translate(-50%, -50%)' }} />
    </div>
  );
}

Geo.propTypes = {
  center: PropTypes.array,
  zoom: PropTypes.number,
  maxZoom: PropTypes.number,
  rotation: PropTypes.number,
  onEvent: PropTypes.func,
  skipRemodify: PropTypes.func,
  menuTitle: PropTypes.string,
  menuContent: PropTypes.string,
  layers: PropTypes.array,
  features: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
  projection: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
}

export default Geo;