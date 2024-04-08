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
import { defaults as defaultInteractions } from 'ol/interaction/defaults';

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
//import UndoRedo from 'ol-ext/interaction/UndoRedo'
import UndoRedo from './helpers/UndoRedo'
import ModifyFeature from 'ol-ext/interaction/ModifyFeature'
import LayerSwitcher from 'ol-ext/control/LayerSwitcher'
import DrawRegular from 'ol-ext/interaction/DrawRegular'

///Local import
import RotateNorthControl from './RotateNorthControl'
import { createLayer, setFeatures } from './helpers/Layers'
import { animate, geoJsonStyleFunction, useScreenSize } from './helpers'

//WorkArround, undo needs getSource
class LayerGroupUndo extends LayerGroup {
  getSource() { return null }
}

const defMinDate = '1900'

/**
 * Geo component renders an OpenLayers map with various features like 
 * layers, controls, interactions etc. based on passed props.
 * Handles map events and bubble them up to parent component.
 * Allows dynamically updating layers, controls, interactions etc.
*/
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
    displayInLayerSwitcher: false,
    source: new VectorSource(),
    style: geoJsonStyleFunction
  }))
  // Vector layer for the tracker
  const [trackerVector] = useState(new VectorLayer({
    name: 'tracker',
    displayInLayerSwitcher: false,
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

  //Return an external value object
  const externalValue = function (name, obj) {
    if (!obj) obj = props.external || {}
    const names = name.split('.', 2)
    if (names.length > 1) {
      if (obj[names[0]]) return externalValue(names[1], obj[names[0]])
      return null //not found
    }
    return obj[names[0]]
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

      const layers = (Array.isArray(props.layers) ? props.layers : [])
        .map(layerConfig => createLayer(layerConfig, map))
        .filter(layer => layer !== null && layer !== undefined)
      var workinglayers = [...layers]
      //Sort all layers an groups and add them to map
      const layerGroups = {}
      layers.forEach((layer) => {
        const idx = workinglayers.indexOf(layer);
        if (layer.get('timeline')) {
          layer.setVisible(false) //Timelines is always invisable
          var g = "timeline"
          layerGroups[g] = layerGroups[g] ? [...layerGroups[g], layer] : [layer]
          //Remove the layer from working layers
          if (layerGroups[g].length == 1) {
            workinglayers[idx] = g
          } else {
            workinglayers.splice(idx, 1);
          }
        } else if (layer.get('groups')) {
          const groups = layer.get('groups')
          const gr = Array.isArray(groups) ? groups : [groups]
          gr.forEach((g) => {
            layerGroups[g] = layerGroups[g] ? [...layerGroups[g], layer] : [layer]
            //Remove the layer from working layers
            if (layerGroups[g].length == 1) {
              workinglayers[idx] = g
            } else {
              workinglayers.splice(idx, 1);
            }
          })
        }
      });
      //Convert layerGroups into LayerGroups by adding them on the key position
      for (const [key, value] of Object.entries(layerGroups)) {
        workinglayers[workinglayers.indexOf[key]] = new LayerGroupUndo({
          name: key,
          title: key.charAt(0).toUpperCase() + key.slice(1),
          layers: value,
          displayInLayerSwitcher: key !== "timeline"
        })
      }
      //Add the in reverse order to the map
      for (let i = workinglayers.length - 1; i >= 0; i--) {
        map.addLayer(workinglayers[i])
      }

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


  useEffect(() => {
    if (geoRef) {
      geoRef.innerHTML = "<div id='GEO_" + geoId + "' " + (featureEnabled('largeButtons') ? "class='ol-large'" : "") +
        "  style='height:100%;width:100%'></div>"

      //The real map object
      var map = new Map({
        controls: [],
        view: new View({
          center: fromLonLat(props.center.length == 2 ? props.center : geoLoc),
          zoom: props.zoom,
          maxZoom: props.maxZoom,
          rotation: props.rotation,
          projection: props.projection,
          extent: props.extent && props.extent.length == 4 ?
            transformExtent(props.extent, 'EPSG:4326', props.projection) :
            [-Infinity, -Infinity, Infinity, Infinity]
        }),
        target: 'GEO_' + geoId,
        layers: [],
      });
      setMap(map)
      fireEvent('map:create', map);

      //Add the buttons contols
      var zoom = new Zoom({
        className: 'ol-zoom',
        zoomInLabel: '+',
        zoomOutLabel: '-'
      })
      if (!featureEnabled('menu')) zoom.element.classList.add('nomenu')
      if (featureEnabled('zoom')) map.addControl(zoom)

      //Main menubar
      var mainbar = new Bar({ className: "mainbar" });
      mainbar.setPosition("top-left")
      if (!featureEnabled('menu')) mainbar.element.classList.add('nomenu')
      if ((featureEnabled('modify')
        && (featureEnabled('modify:move') || featureEnabled('modify:point') || featureEnabled('modify:line')
          || featureEnabled('modify:polygon') || featureEnabled('modify:oval')
          || featureEnabled('modify:undo') || featureEnabled('modify:redo') || featureEnabled('modify:clear')
          || featureEnabled('modify:delete')))
        || featureEnabled('save')
        || featureEnabled('center'))
        map.addControl(mainbar);

      //GeoLocation
      var geoLocation = new Button({
        html: '<i class="fa fa-crosshairs"></i>',
        title: "Center",
        handleClick: function (e) {
          centerMe(true).then((coords) => {
            animate(map, coords, 3000, { zoom: 16, _locDuration: 2000, _pulseCount: 6, _easing: 'bounce' }, "home")
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
          || featureEnabled('modify:polygon') || featureEnabled('modify:oval')
          || featureEnabled('modify:undo') || featureEnabled('modify:redo') || featureEnabled('modify:clear')
          || featureEnabled('modify:delete'))
          mainbar.addControl(editbar);

        //Add modify interaction
        const modify = new ModifyFeature({ source: drawVector.getSource() });
        if (featureEnabled("modify:move")) map.addInteraction(modify);
        modify.setActive(false)

        const snap = new Snap({ source: drawVector.getSource() });
        if (featureEnabled("modify:snap")) map.addInteraction(snap);
        snap.setActive(false)

        // Add move Editing tools
        var pmove = new Toggle({
          html: '<i class="fa fa-up-down-left-right" ></i>',
          title: 'Move',
          onToggle: (active) => {
            snap.setActive(active)
            modify.setActive(active)
          }
        });
        pmove.on('change:disable', function () {
          snap.setActive(false)
          modify.setActive(false)
        })
        if (featureEnabled('modify:move')) editbar.addControl(pmove);

        // Add Point editing
        var pedit = new Toggle({
          html: '<i class="fa fa-map-marker" ></i>',
          title: 'Point',
          onToggle: (active) => {
          },
          interaction: new Draw({
            type: 'Point',
            source: drawVector.getSource(),
          })
        });
        if (featureEnabled('modify:point')) editbar.addControl(pedit);

        // Add Cirle editing 
        var cedit = new Toggle({
          html: '<i class="fa fa-circle" ></i>',
          title: 'Oval',
          onToggle: (active) => {
          },
          interaction: new DrawRegular({
            source: drawVector.getSource(),
            // geometryName: 'geom',
            // condition: ol.events.condition.altKeyOnly,
            sides: 0,
            //canRotate: $("#rotation").prop('checked')
          })
        });
        if (featureEnabled('modify:oval')) editbar.addControl(cedit);

        //Line editing
        var ledit = new Toggle({
          html: '<i class="fa fa-share-alt" ></i>',
          title: 'Line',
          onToggle: (active) => {

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

        //Polygon editing
        var fedit = new Toggle({
          html: '<i class="fa fa-bookmark fa-rotate-270" ></i>',
          title: 'Polygon',
          onToggle: (active) => {
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
            snap.setActive(active);
          }
        });
        pdelete.on('change:disable', function () {
          snap.setActive(false)
        })

        if (featureEnabled('modify:delete')) editbar.addControl(pdelete);

        // Undo redo interaction
        var undoInteraction = new UndoRedo({ layers: [drawVector] });
        undoInteraction.on('stack:add', function (e) {
          if (e.action.name != "set")
            fireEvent("modify:add", e)
        })
        undoInteraction.on('stack:remove', function (e) {
          fireEvent("modify:remove", e)
        })
        map.addInteraction(undoInteraction);

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


        // Add a simple push button to undo features
        var clear = new Button({
          html: '<i class="fa fa-trash-arrow-up"></i>',
          title: "Clear",
          handleClick: function (e) {
            undoInteraction.blockStart("clear")
            undoInteraction._layers.forEach((layer) => { layer.getSource().clear() })
            undoInteraction.clear();
            undoInteraction.blockEnd()
          }
        });
        if (featureEnabled('modify:clear')) mainbar.addControl(clear);
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
      if (featureEnabled('fullscreen')) map.addControl(fullscreen)

      var secondbar = new Bar({ className: "ol-secondbar" });
      secondbar.setPosition("top-right")
      if ((featureEnabled('splitscreen') && (featureEnabled('splitscreen:horizontal') || featureEnabled('splitscreen:vertical')))
        || (featureEnabled('timeline') && featureEnabled('timeline')))
        map.addControl(secondbar);

      // Add a simple push button to save features
      // Add control inside the map
      var layerCtrl = new LayerSwitcher({
        target: externalValue('layerswitcher.target')
        // collapsed: false,
        // mouseover: true
      });
      //Connect external drawer if needed
      if (externalValue('layerswitcher.draw')) {
        layerCtrl.on('drawlist', externalValue('layerswitcher.draw'))
      }
      if (featureEnabled('layers')) map.addControl(layerCtrl);

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
              map.addControl(swipectrl)
              swipectrl.set('orientation', 'horizontal')
              swipectrl.set('position', 0.5)
              swipectrl.removeLayers();
              findSplits(map.getLayers())
            } else {
              map.removeControl(swipectrl)
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
              map.addControl(swipectrl)
              swipectrl.set('orientation', 'vertical')
              swipectrl.set('position', 0.5)
              swipectrl.removeLayers();
              findSplits(map.getLayers())
            } else {
              map.removeControl(swipectrl)
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
      map.addControl(menu);

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
      if (featureEnabled('menu')) map.addControl(toggle);

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
                if (layer instanceof LayerGroup) {
                  fillTimeline(layer.getLayers())
                } else if (layer.get("timeline")) {
                  histo.push[layer]
                }
              })
            }
            fillTimeline(map.getLayers())
            tline.setFeatures(histo)

            scaleLineControl.element.classList.add('timeline')
            geoTracker.element.classList.add('timeline')
            geoLocation.element.classList.add('timeline')
            map.addControl(tline);
            fireEvent('timeline:state', true)
          } else {
            scaleLineControl.element.classList.remove('timeline')
            geoTracker.element.classList.remove('timeline')
            geoLocation.element.classList.remove('timeline')
            map.removeControl(tline);
            //Work arround voor scaleLineControl not moving
            map.removeControl(scaleLineControl);
            map.addControl(scaleLineControl);
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
        map.addControl(geoTracker)

      //rotateNorth control
      var rotateNorth = new RotateNorthControl();
      if (featureEnabled('north')) mainbar.addControl(rotateNorth);

      // CanvasScaleLine control
      var scaleLineControl = new CanvasScaleLine();
      if (featureEnabled('scale')) map.addControl(scaleLineControl);

      //Handling Events
      const singleClick = function (evt) {
        var _feature = false;
        map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
          // Vector feature click logic
          if (!(featureEnabled('modify') &&
            (pdelete.getActive() || pmove.getActive() || cedit.getActive() ||
              pedit.getActive() || ledit.getActive() || fedit.getActive()))
            && layer && layer.get("selectable") !== false && feature) { //only fire event if we are not drawing
            fireEvent('click:feature', {
              extent: transformExtent(feature.getGeometry()?.extent_, map.getView().getProjection(), 'EPSG:4326') || [],
              properties: feature.getProperties() || {},
              layer: layer.get("name")
            })
            _feature = true;
            return true; // Stop iterating through features
          }

        });

        //Fire the click event only if not feature and not in edit mode
        if (!_feature && (!(featureEnabled('modify') &&
          (pdelete.getActive() || pmove.getActive() || cedit.getActive() ||
            pedit.getActive() || ledit.getActive() || fedit.getActive()))))
          fireEvent('click:single', evt)
      }
      // Click event listener for vector features and WMS GetFeatureInfo
      map.on('singleclick', singleClick);

      // Optional: pointer move logic for changing cursor over WMS layers
      map.on('pointermove', function (evt) {
        if (evt.dragging) return; // skip if the map is being dragged

        var cursorStyle = 'default'; // Default cursor style
        const pixel = map.getEventPixel(evt.originalEvent);

        // Check for features at the current pointer position
        map.forEachFeatureAtPixel(pixel, function (feature, layer) {
          // If a layer is found and its selectable property is not false
          //console.debug('Hover feature on layer:', layer);
          if (layer && layer.get('selectable') !== false) {
            cursorStyle = 'pointer'; // Change the cursor to pointer
            return false; // Stop iterating through the features
          }
        });

        // Apply the determined cursor style to the map target element
        map.getTargetElement().style.cursor = cursorStyle;
      });


      //Handle the loaded event
      map.on('loadend', function (event) {
        fireEvent('map:loaded', event)
      });

      //Handle zoom event
      var zoomTimer
      map.getView().on('change:resolution', (event) => {
        if (zoomTimer) clearTimeout(zoomTimer)
        zoomTimer = setTimeout(() => {
          fireEvent('map:zoom', Object.assign({}, event, { newValue: map.getView().getResolution(), zoom: map.getView().getZoom() }))
        }, 200)
      });

      //On move
      map.on('moveend', () => {
        const extent = map.getView().calculateExtent(map.getSize()); // Get the current extent
        const transformedExtent = transformExtent(extent, map.getView().getProjection(), 'EPSG:4326'); // Transform the extent to WGS 84
        fireEvent('bbox:change', transformedExtent); // Call the callback with the updated bbox
      }
      );

      // Notification Control
      map.addControl(notification);

      // Load all layers
      loadLayers(map)

      //Add map init event
      fireEvent('map:init', map)
    }
  }, [props.features, props.extent, props.projection, props.startDate, props.endDate, props.external, geoRef]);


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
    if (map) {
      loadLayers(map)
    }
  }, [props.layers, props.features.modify, props.features.tracker]); // Re-evaluate when layers change

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
  extent: PropTypes.array,
  external: PropTypes.object,
}

export default Geo;