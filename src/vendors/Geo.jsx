//CSS
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import "@fortawesome/fontawesome-free/css/all.css"
import "./styles.css";

import React, { useState } from 'react';
import PropTypes from 'prop-types'
import {RingLoader} from 'react-spinners'

//The real GEO OpenLayers packages
import {Map, View} from 'ol/index';
import {Tile as TileLayer} from 'ol/layer';
import {XYZ} from 'ol/source';
import {LineString,Polygon} from 'ol/geom';
//import ZoomSlider from 'ol/control/ZoomSlider.js';
import {fromLonLat} from 'ol/proj';
import {FullScreen, Zoom } from 'ol/control';
import {Style, Stroke} from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM'
import GeolocationBar from 'ol-ext/control/GeolocationBar'
import GeolocationButton from 'ol-ext/control/GeolocationButton'
import CanvasScaleLine from 'ol-ext/control/CanvasScaleLine'
import Notification from 'ol-ext/control/Notification'
import Bar from 'ol-ext/control/Bar'
import Button from 'ol-ext/control/Button'
import Toggle from 'ol-ext/control/Toggle'
import Select from 'ol-ext/control/Select'
import Overlay from 'ol-ext/control/Overlay'
import Timeline from 'ol-ext/control/Timeline'
import {Draw} from 'ol/interaction'
import UndoRedo from 'ol-ext/interaction/UndoRedo'


function Geo(props) {
  const [geoRef, setGeoRef] = React.useState();
  const [geoLoc,setGeoLoc] = React.useState();
  const geoId = Math.random().toString(16).slice(2);

  const variants = [
    'standaard',
		'pastel',
		'grijs',
		'water',
  ];

  var varaint = variants[0]
  var lightStroke = new Style({
    stroke: new Stroke({
      color: [255, 255, 255, 0.6],
      width: 2,
      lineDash: [4,8],
      lineDashOffset: 6
    })
  });
  
  var darkStroke = new Style({
    stroke: new Stroke({
      color: [0, 0, 0, 0.6],
      width: 2,
      lineDash: [4,8]
    })
  });

   const useGeoRef = React.useCallback(ref => {
    //Fetch the geolocation based on browser or ip when center is not set
    if ((props.center && props.center.length==2) || (props.defaults && props.defaults.center)) {
      setGeoRef(ref);
    } else {
    navigator.geolocation.getCurrentPosition(
      (success)=>{
        setGeoLoc([success.coords.longitude,success.coords.latitude]) 
        setGeoRef(ref);
      },
      (error)=>{
        fetch('https://ipapi.co/json/')
        .then(function(response) {
          if (!response.ok) {
            setGeoRef(ref);
          } else {
           response.json().then(function(data) {
            setGeoLoc([data.longitude,data.latitude])  
            setGeoRef(ref);
          })
          }
        })
      },
      {maximumAge:60000,timeout:5000,enableHighAccuracy:false});
    }
  }, []);

  React.useEffect(() => {
    if (geoRef && !props.skipRedraw()) {
      //console.log("Redraw")
      // Rebuild the GEOL7
      geoRef.innerHTML = "<div id='GEO_"+ geoId+ "' style='height:"+props.height+"px;position:relative'></div>"
      //const geoCanvas = document.getElementById("GEO_"+geoId) 

      //The base layer containg the streetmap
      var baseLayer = new TileLayer({
        source: new XYZ({
          url: //'https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_ortho25/EPSG:3857/{z}/{x}/{y}.jpeg'
          'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png'
        })
      })

      var osm = new TileLayer({
        title: "OSM",
        source: new OSM(),
      })

      const geoJson = new VectorLayer({
        background: '#1a2b39',
        source: new VectorSource({
          url: 'https://openlayers.org/data/vector/ecoregions.json',
          format: new GeoJSON(),
        }),
        style: {
          'fill-color': ['string', ['get', 'COLOR'], '#eee'],
        },
      });

      // New vector layer
      var vector = new VectorLayer({
        name: 'tracker',
        source: new VectorSource(),
        style: [lightStroke, darkStroke],

      })
      
      //The real map object
      var map = new Map({
       controls: [],
        view: new View({
          center:  fromLonLat((props.center.length==2 ? props.center : props.defaults.center) || geoLoc || []),
          zoom: props.zoom || props.defaults.zoom ,
          maxZoom: props.maxZoom || props.defaults.maxZoom || 1000, 
          pitch : props.pitch || props.defaults.pitch,
          rotation: props.rotation || props.defaults.rotation
        }),
        target: 'GEO_'+ geoId,
        layers: [
        //  baseLayer,
          osm,
         // geoJson,
          vector,
        ]
      });

      //Set the noMenu class based on flag
      var menu = true;
      //Set menuTitle and content
      var menuTitle = "Menu"
      var menuContent = `<p style="border-bottom:1px solid #999;">
      <i>ol.control.Overlay</i> can be used to display a menu or information on the top of the map.
    </p>`

      // Menu Overlay
      var menu = new Overlay ({ 
        closeBox : true, 
        className: "slide-left menu", 
        content: `<div id="menuTitle"><h1>${menuTitle}</h1></div>
        <div id="menuContent">${menuContent}</div>`
      });
      if (!menu) menu.element.classList.add('nomenu')
      map.addControl(menu);
    
      var zoom =  new Zoom({
        className:'ol-zoom',
        zoomInLabel: '+',
        zoomOutLabel: '-'
      })
      if (!menu) zoom.element.classList.add('nomenu')
      map.addControl(zoom)

      // A toggle control to show/hide the menu
      var toggle = new Toggle({
        className: 'menu',
        html: '<i class="fa fa-bars" ></i>',
        title: "Menu",
        onToggle: function() { menu.toggle(); }
      });
      if (menu) map.addControl(toggle);


      //Main menubar
      var mainbar = new Bar({className:"mainbar"});
      mainbar.setPosition("top-left")
      if (!menu) mainbar.element.classList.add('nomenu')
      map.addControl(mainbar);

      // Edit control bar 
      var editbar = new Bar({
        toggleOne: true,	// one control active at the same time
        group:false			// group controls together
      });
      mainbar.addControl(editbar);

      // Add editing tools
      var pedit = new Toggle({
        html: '<i class="fa fa-map-marker" ></i>',
        title: 'Point',
        interaction: new Draw({
          type: 'Point',
          source: vector.getSource()
        })
      });
      editbar.addControl ( pedit );

      var ledit = new Toggle({
        html: '<i class="fa fa-share-alt" ></i>',
        title: 'Line',
        interaction: new Draw({
          type: 'LineString',
          source: vector.getSource(),
          // Count inserted points
          geometryFunction: function(coordinates, geometry) {
            if (geometry) geometry.setCoordinates(coordinates);
            else geometry = new LineString(coordinates);
            this.nbpts = geometry.getCoordinates().length;
            return geometry;
          }
        })
      });
      editbar.addControl ( ledit );

      var fedit = new Toggle({
        html: '<i class="fa fa-bookmark fa-rotate-270" ></i>',
        title: 'Polygon',
        interaction: new Draw({
          type: 'Polygon',
          style: [lightStroke, darkStroke],
          source: vector.getSource(),
          // Count inserted points
          geometryFunction: function(coordinates, geometry) {
            //this.nbpts = coordinates[0].length;
            if (geometry) geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])]);
            else geometry = new Polygon(coordinates);
            return geometry;
          }
        })
      });
      editbar.addControl ( fedit );

          // Undo redo interaction
    var undoInteraction = new UndoRedo();
    map.addInteraction(undoInteraction);

      // Add a simple push button to undo features
      var undo = new Button({
        html: '<i class="fa fa-undo"></i>',
        title: "Undo",
        handleClick: function(e) {
          undoInteraction.undo();
        }
      });
      mainbar.addControl (undo );
        // Add a simple push button to redo features
        var redo = new Button({
        html: '<i class="fa fa-redo"></i>',
        title: "Redo",
        handleClick: function(e) {
          undoInteraction.redo();
        }
      });
      mainbar.addControl (redo);

      // Add a simple push button to save features
      var save = new Button({
        html: '<i class="fa fa-download"></i>',
        title: "Save",
        handleClick: function(e) {
          var json= new GeoJSON().writeFeatures(vector.getSource().getFeatures());
          console.log(json);
        }
      });
      mainbar.addControl (save );

      //Fullscreen
      var fullscreen = new FullScreen()
      map.addControl(fullscreen)

      var secondbar = new Bar();
      secondbar.setPosition("top-right")
      map.addControl(secondbar);

      // Add a simple push button to save features
      var layers = new Toggle({
        html: '<i class="fa fa-layer-group"></i>',
        title: "Layers",
        handleClick: function(e) {
          var json= new GeoJSON().writeFeatures(vector.getSource().getFeatures());
          console.log(json);
        }
      });
      secondbar.addControl (layers );

      /*
      // Edit control bar 
      var seditbar = new Bar({
        toggleOne: true,	// one control active at the same time
        group:false			// group controls together
      });
      secondbar.addControl(seditbar);
      */

      var split = new Toggle({
        html: '<i class="fa fa-table-columns"></i>', 
        title: "Split",
        handleClick: function(e) {
          var json= new GeoJSON().writeFeatures(vector.getSource().getFeatures());
          console.log(json);
        }
      });
      secondbar.addControl (split );

      var timeline = new Toggle({
        html: '<i class="fa fa-clock"></i>', 
        title: "Timeline",
        onToggle: function(e) {
        }
      });
      secondbar.addControl (timeline );


      //GeoLocation
      var geoloc = new GeolocationButton({
        title : "GeoLocation",
        delay : 5000
      });
      map.addControl(geoloc);
      geoloc.on("change:active",(event)=>{
        if (event.active) {
          notification.show("Searching GPS",3000)
        }
      });
      //change:active

    
      //Add a GeoTracker
      var geoTracker = new GeolocationBar({
        source: vector.getSource(),
        delay : 5000,
        followTrack: 'auto',
        minZoom: 16,
        minAccuracy:10000
      });
      map.addControl(geoTracker)

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
        getFeatureDate: function(l) { return l.get('name'); },
        getHTML: function(l) { return l.get('name'); }
      });

      tline.on('scroll', function(e) {
        var layer, dmin = Infinity;
        histo.forEach(function(l, i) {
          var d = new Date(l.get('name'));
          var dt = Math.abs(e.date-d);
          if (dt < dmin) {
            layer = l;
            dmin = dt;
          }
          if (i!==0) l.setVisible(false);
        });
        if (layer){
          layer.setVisible(true);
          $('.date').text(layer.get('title') || layer.get('name'));
        }
      });
      tline.on('select', function(e) {
        tline.setDate(e.feature);
      });
      
      // CanvasScaleLine control
      var scaleLineControl = new CanvasScaleLine();
      map.addControl(scaleLineControl);

      //Toggle the timeline classes
      timeline.on("change:active",(event)=>{
        if (event.active) {
          scaleLineControl.element.classList.add('timeline')
          geoTracker.element.classList.add('timeline')
          geoloc.element.classList.add('timeline')
          map.addControl(tline);
        } else {
          scaleLineControl.element.classList.remove('timeline')
          geoTracker.element.classList.remove('timeline')
          geoloc.element.classList.remove('timeline')
          map.removeControl(tline);
          //Work arround voor scaleLineControl not moving
          map.removeControl(scaleLineControl);
          map.addControl(scaleLineControl);
        }
      });

      // Notification Control
      var notification = new Notification({
      });
      map.addControl(notification);

      //Add the supported events
      map.on('loadend', function (event) {
        props.onLoadEnd(event,notification)
      });
      map.on('click', function(event) {
        props.onClick(event,notification)
      });
      map.getView().on('change:resolution', (event) => {
        props.onZoom(event, map.getView().getResolution(),notification)
      });


      if (!props.showLogo) {
        //geoCanvas.getElementsByClassName('l7-control-logo')[0].style="display:none" 
      }
    }
  }, [geoRef, props.center,props.zoom,props.maxZoom,props.rotation, props.pitch,props.geoJson,
      props.showLogo,
      props.onDataChange,props.onLoadEnd,props.onZoom,props.defaults,geoLoc
  ]);

  return (
    <div
      ref={useGeoRef}
      style={{ height: '100%', width: '100%' }}
    >
    <RingLoader color="#36d7b7" 
        style={{position: 'absolute',top: '45%',left: '48%',transform: 'translate(-50%, -50%)'}} />
    </div>
  );
}

Geo.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  center: PropTypes.array,
  zoom: PropTypes.number,
  maxZoom: PropTypes.number,
  rotation: PropTypes.number,
  pitch: PropTypes.number,
  geoJson: PropTypes.object,
  showLogo : PropTypes.bool,
  onDataChange: PropTypes.func,
  onLoadEnd: PropTypes.func,
  onClick: PropTypes.func,
  onZoom: PropTypes.func,
  skipRedraw: PropTypes.func,
  defaults: PropTypes.object,
}

export default Geo;