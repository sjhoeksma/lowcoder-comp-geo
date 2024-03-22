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
import { Vector as VectorLayer } from 'ol/layer';
import { TileWMS, Vector as VectorSource } from 'ol/source';
import TileLayer from 'ol/layer/WebGLTile.js';
import { LineString, Polygon } from 'ol/geom';
import { fromLonLat, transformExtent } from 'ol/proj';
import { FullScreen, Zoom } from 'ol/control';
import { GeoJSON } from 'ol/format';
import { Draw, Snap, Select } from 'ol/interaction'

//Openlayer Extend imports
import GeolocationBar from 'ol-ext/control/GeolocationBar'
import GeolocationButton from 'ol-ext/control/GeolocationButton'
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
import { animate, geoJsonStyleFunction } from './helpers'

function Geo(props) {
  const [geoRef, setGeoRef] = useState();
  const [geoLoc, setGeoLoc] = useState();
  const [map, setMap] = useState();
  const [geoId] = useState(Math.random().toString(16).slice(2));
  //Global notification item
  const [notification] = useState(new Notification({}))
  // Vector layer for drawing
  const [drawVector] = useState(new VectorLayer({
    name: 'drawing',
    source: new VectorSource(),
    style: geoJsonStyleFunction
  }))
  // Vector layer for the tracker
  const [trackerVector] = useState(new VectorLayer({
    name: 'tracker',
    source: new VectorSource(),
  }))

  //Function to check if updating of a variable is allowed
  const allowUpdate = function (name) {
    return !(props.ignoreUpdate && props.ignoreUpdate(name))
  }

  //Function to check if updating of a variable is allowed
  const featureEnabled = function (name) {
    return !((props.features && props.features[name] === false))
  }

  const fireEvent = function (name, eventObject) {
    if (props.onEvent) {
      props.onEvent(name, eventObject || {})
    }
  }

  //All buttons are shown by default
  const showButton = function (name) {
    var btnBlock = name.split(':')[0]
    return ((props.buttons && (props.buttons[name] === false || props.buttons[btnBlock] === false)) ||
      (props.defaults && props.defaults.buttons && (props.defaults.buttons[name] === false || props.defaults.buttons[btnBlock] === false)))
      ? false : true
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
      // Validate and create new layers
      const layers = Array.isArray(props.layers) ? props.layers :
        props.defaults && Array.isArray(props.defaults.layers) ? props.defaults.layers : [];
      const validatedLayers = layers.filter(layer => layer !== null && layer !== undefined);
      const sortedLayers = validatedLayers
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(createLayer)
        .filter(layer => layer !== null && layer !== undefined);
      map.getLayers().clear();
      sortedLayers.forEach(layer => { if (layer) map.addLayer(layer) });

      //TrackerVector
      if (featureEnabled('tracker')) {
        map.addLayer(trackerVector)
      }
      //Add drawLayer and values if set
      if (featureEnabled('draw')) {
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
          center: fromLonLat((props.center.length == 2 ? props.center : props.defaults.center) || geoLoc || [0, 0]),
          zoom: props.zoom || props.defaults.zoom,
          maxZoom: props.maxZoom || props.defaults.maxZoom || 100,
          rotation: props.rotation || props.defaults.rotation
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
      if (!showButton('menu')) zoom.element.classList.add('nomenu')
      if (showButton('zoom')) olMap.addControl(zoom)

      //Main menubar
      var mainbar = new Bar({ className: "mainbar" });
      mainbar.setPosition("top-left")
      if (!showButton('menu')) mainbar.element.classList.add('nomenu')
      if ((featureEnabled('draw')
        && (showButton('draw:move') || showButton('draw:point') || showButton('draw:line')
          || showButton('draw:polygon') || showButton('draw:undo') || showButton('draw:redo')
          || showButton('draw:delete')))
        || showButton('save')
        || showButton('center'))
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
      if (showButton('center')) mainbar.addControl(geoLocation)


      if (featureEnabled('draw')) {
        // Edit control bar 
        var editbar = new Bar({
          toggleOne: true,	// one control active at the same time
          group: false			// group controls together
        });
        if (showButton('draw:move') || showButton('draw:point') || showButton('draw:line')
          || showButton('draw:polygon') || showButton('draw:undo') || showButton('draw:redo')
          || showButton('draw:delete'))
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
        if (showButton('draw:move')) editbar.addControl(pmove);

        // Add editing tools
        var pedit = new Toggle({
          html: '<i class="fa fa-map-marker" ></i>',
          title: 'Point',
          onToggle: () => {
            olMap.removeInteraction(snap);
            olMap.removeInteraction(modify);
          },
          interaction: new Draw({
            type: 'Point',
            source: drawVector.getSource(),
          })
        });
        if (showButton('draw:point')) editbar.addControl(pedit);

        var ledit = new Toggle({
          html: '<i class="fa fa-share-alt" ></i>',
          title: 'Line',
          onToggle: () => {
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
        if (showButton('draw:line')) editbar.addControl(ledit);

        var fedit = new Toggle({
          html: '<i class="fa fa-bookmark fa-rotate-270" ></i>',
          title: 'Polygon',
          onToggle: () => {
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
        if (showButton('draw:polygon')) editbar.addControl(fedit);

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
        if (showButton('draw:delete')) editbar.addControl(pdelete);

        // Undo redo interaction
        var undoInteraction = new UndoRedo({ layers: [drawVector] });
        undoInteraction.on('stack:add', function (e) {
          fireEvent("draw:add")
        })
        undoInteraction.on('stack:remove', function (e) {
          fireEvent("draw:remove")
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
        if (showButton('draw:undo')) mainbar.addControl(undo);

        // Add a simple push button to redo features
        var redo = new Button({
          html: '<i class="fa fa-redo"></i>',
          title: "Redo",
          handleClick: function (e) {
            undoInteraction.redo();
          }
        });
        if (showButton('draw:redo')) mainbar.addControl(redo);
      }

      // Add a simple push button to save features
      var save = new Button({
        html: '<i class="fa fa-download"></i>',
        title: "Save",
        handleClick: function (e) {
          fireEvent("save")
        }
      });
      if (showButton("save")) mainbar.addControl(save);

      //Fullscreen
      var fullscreen = new FullScreen()
      if (showButton('fullscreen')) olMap.addControl(fullscreen)

      var secondbar = new Bar({ className: "ol-secondbar" });
      secondbar.setPosition("top-right")
      if ((featureEnabled('swipe') && (showButton('swipeHorizontal') || showButton('swipeVertical')))
        || (featureEnabled('timeline') && showButton('timeline')))
        olMap.addControl(secondbar);

      // Add a simple push button to save features
      // Add control inside the map
      var layerCtrl = new LayerSwitcher({
        // collapsed: false,
        // mouseover: true
      });
      if (showButton('layers')) olMap.addControl(layerCtrl);

      // Swipe control bar 
      if (featureEnabled('swipe')) {
        // Swipe control bar 
        var swipebar = new Bar({
          toggleOne: true,	// one control active at the same time
          group: false			// group controls together
        });
        if (showButton('swipe:vertical') || showButton('swipe:horizontal'))
          secondbar.addControl(swipebar);

        var swipectrl = new Swipe({});
        swipectrl.set('position', 0, 5)
        //Todo Add the layers for the swipe control

        var swipeHorz = new Toggle({
          html: '<i class="fa fa-grip-lines-vertical fa-rotate-90"></i>',
          title: "Swipe Horizontal",
          onToggle: function (event) {
            if (event.active) {
              swipectrl.set('orientation', 'horizontal')
              olMap.addControl(swipectrl)
            } else {
              olMap.removeControl(swipectrl)
            }
            fireEvent("toggle:swipe:horizontal", event)
          }
        });
        if (showButton('swipe:horizontal')) swipebar.addControl(swipeHorz);

        var swipeVert = new Toggle({
          html: '<i class="fa fa-grip-lines-vertical "></i>',
          title: "Swipe Vertical",
          onToggle: function (event) {
            if (event.active) {
              swipectrl.set('orientation', 'vertical')
              olMap.addControl(swipectrl)
            } else {
              olMap.removeControl(swipectrl)
            }
            fireEvent("toggle:swipe:vertical", event)
          }
        });
        if (showButton('swipe:vertical')) swipebar.addControl(swipeVert);
      }

      // Menu Overlay
      var menu = new Overlay({
        closeBox: true,
        className: "slide-left menu",
        content: `<div id="menuTitle" ><h1 id="menuTitle_` + geoId + `">${props.menuTitle.trim() || (props.defaults && props.defaults.menuTitle) || "&nbsp;"}</h1></div>
        <div id="menuContent_`+ geoId + `">${props.menuContent || (props.defaults && props.defaults.menuContent)}</div>`
      });
      if (!showButton('menu')) menu.element.classList.add('nomenu')
      olMap.addControl(menu);

      // A toggle control to show/hide the menu
      var toggle = new Toggle({
        className: 'ol-menu',
        html: '<i class="fa fa-bars" ></i>',
        title: "Menu",
        onToggle: function (event) {
          menu.toggle();
          fireEvent("toggle:menu", event)
        }
      });
      if (showButton('menu')) olMap.addControl(toggle);

      if (featureEnabled('timeline')) {
        var histo = [
          /* no more ?
          new ol.layer.Geoportail({ 
            name: '1970',
            title: '1965-1980',
            key: 'orthohisto',
            layer: 'ORTHOIMAGERY.ORTHOPHOTOS.1965-1980' 
          }),
          */
        ]
        //Timeline
        var tline = new Timeline({
          className: 'ol-pointer ol-zoomhover ol-timeline',
          features: histo,
          minDate: new Date('1923'),
          maxDate: new Date(),
          getFeatureDate: function (l) { return l.get('name'); },
          getHTML: function (l) { return l.get('name'); }
        });

        tline.on('scroll', function (e) {
          var layer, dmin = Infinity;
          histo.forEach(function (l, i) {
            var d = new Date(l.get('name'));
            var dt = Math.abs(e.date - d);
            if (dt < dmin) {
              layer = l;
              dmin = dt;
            }
            if (i !== 0) l.setVisible(false);
          });
          if (layer) {
            layer.setVisible(true);
            $('.date').text(layer.get('title') || layer.get('name'));
          }
        });
        tline.on('select', function (e) {
          tline.setDate(e.feature);
        });


        var timeline = new Toggle({
          html: '<i class="fa fa-clock"></i>',
          title: "Timeline",
          onToggle: function (e) {
            fireEvent("toggle:timeline", e)
          }
        });
        if (showButton('timeline')) secondbar.addControl(timeline);
        //Toggle the timeline classes
        timeline.on("change:active", (event) => {
          if (event.active) {
            scaleLineControl.element.classList.add('timeline')
            geoTracker.element.classList.add('timeline')
            geoLocation.element.classList.add('timeline')
            olMap.addControl(tline);
            fireEvent('timeline:active')
          } else {
            scaleLineControl.element.classList.remove('timeline')
            geoTracker.element.classList.remove('timeline')
            geoLocation.element.classList.remove('timeline')
            olMap.removeControl(tline);
            //Work arround voor scaleLineControl not moving
            olMap.removeControl(scaleLineControl);
            olMap.addControl(scaleLineControl);
            fireEvent('timeline:inactive')
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
      if (featureEnabled('tracker') && showButton('tracker'))
        olMap.addControl(geoTracker)

      //rotateNorth control
      var rotateNorth = new RotateNorthControl();
      if (showButton('north')) mainbar.addControl(rotateNorth);

      // CanvasScaleLine control
      var scaleLineControl = new CanvasScaleLine();
      if (showButton('scale')) olMap.addControl(scaleLineControl);

      //Handling Events
      const singleClick = function (evt) {
        var _feature = false;
        olMap.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
          // Vector feature click logic
          if (!(featureEnabled('draw') &&
            (pdelete.getActive() || pmove.getActive() ||
              pedit.getActive() || ledit.getActive() || fedit.getActive()))
            && layer && layer.get("selectable") === true && feature) { //only fire event if we are not drawing
            fireEvent('click:feature', {
              extent: transformExtent(feature.getGeometry()?.extent_, 'EPSG:3857', 'EPSG:4326') || [],
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
        if (evt.dragging) return;
        const pixel = olMap.getEventPixel(evt.originalEvent);
        const hit = olMap.hasFeatureAtPixel(pixel);
        olMap.getTargetElement().style.cursor = hit ? 'pointer' : '';
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
        const transformedExtent = transformExtent(extent, 'EPSG:3857', 'EPSG:4326'); // Transform the extent to WGS 84
        fireEvent('bbox:change', transformedExtent); // Call the callback with the updated bbox
      }
      );

      // Notification Control
      olMap.addControl(notification);

      //loadLayers(olMap)

      //Add map init event
      fireEvent('map:init', olMap);

      setMap(olMap)
    }
  }, [geoRef, props.defaults, props.buttons, props.features]);

  useEffect(() => {
    if (map) {
      geoRef.style.height = `${props.height}px`;
      //geoRef.style.width=`${props.width}px`;
    }
  }, [map, props.height, props.width])

  //Zoom handling
  useEffect(() => {
    if (map) map.getView().setZoom(props.zoom)
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
      if (props.center && props.center.length == 2) map.getView().setCenter(fromLonLat(props.center))
      else if (geoLoc) {
        map.getView().setCenter(fromLonLat(geoLoc))
      }
    }
  }, [map, props.center, geoLoc]);
  //Menu title
  useEffect(() => {
    if (map) {
      var el = document.getElementById('menuTitle_' + geoId)
      if (el) el.innerHTML = (props.menuTitle.trim() || (props.defaults && props.defaults.menuTitle) || "&nbsp;")
    }
  }, [props.menuTitle]);
  //Menu content
  useEffect(() => {
    if (map) {
      var el = document.getElementById('menuContent_' + geoId)
      if (el) el.innerHTML = props.menuContent || (props.defaults && props.defaults.menuContent)
    }
  }, [props.menuContent]);

  // Dynamic layer updating
  useEffect(() => {
    loadLayers(map)
  }, [map, props.layers]); // Re-evaluate when layers change

  //GPS location
  useEffect(() => {
    if (featureEnabled('gpsCentered') && !map) {
      centerMe()
    }
  }, [elementRef]);

  return (
    <div
      ref={elementRef}
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
  skipRedraw: PropTypes.func,
  buttons: PropTypes.object,
  menuTitle: PropTypes.string,
  menuContent: PropTypes.string,
  layers: PropTypes.array,
  defaults: PropTypes.object,
  features: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
}

export default Geo;