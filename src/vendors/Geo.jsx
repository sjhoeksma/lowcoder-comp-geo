//CSS
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import "@fortawesome/fontawesome-free/css/all.css"

import React, { useState } from 'react';
import PropTypes from 'prop-types'

//The real GEO OpenLayers packages
import {Map, View} from 'ol/index';
import {Tile as TileLayer} from 'ol/layer';
import {XYZ} from 'ol/source';
import {LineString,Polygon} from 'ol/geom';
//import ZoomSlider from 'ol/control/ZoomSlider.js';
import {fromLonLat} from 'ol/proj';
import {Control, defaults as defaultControls, FullScreen, Zoom } from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM'
import GeolocationBar from 'ol-ext/control/GeolocationBar'
import CanvasScaleLine from 'ol-ext/control/CanvasScaleLine'
import Notification from 'ol-ext/control/Notification'
import Bar from 'ol-ext/control/Bar'
import Button from 'ol-ext/control/Button'
import Toggle from 'ol-ext/control/Toggle'
import Select from 'ol-ext/control/Select'
import Draw from 'ol/interaction/Draw'


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

   const useGeoRef = React.useCallback(ref => {
    //Fetch the geolocation based on browser or ip
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
        source: new VectorSource()
      });

      const map_controls = [ 
        new FullScreen(),
        new GeolocationBar({
          source: vector.getSource(),
          followTrack: 'auto',
          minZoom: 16,
          minAccuracy:10000
        }),
        new Zoom({
          zoomInLabel: '+',
          zoomOutLabel: '-'
        }),
      ];
      

      var map = new Map({
        controls: map_controls,
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

      var mainbar = new Bar();
      mainbar.setPosition("top-left")
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
        title: 'LineString',
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
          source: vector.getSource(),
          // Count inserted points
          geometryFunction: function(coordinates, geometry) {
            this.nbpts = coordinates[0].length;
            if (geometry) geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])]);
            else geometry = new Polygon(coordinates);
            return geometry;
          }
        })
      });
      editbar.addControl ( fedit );

      // Add a simple push button to save features
      var save = new Button({
        html: '<i class="fas fa-download"></i>',
        title: "Save",
        handleClick: function(e) {
          var json= new GeoJSON().writeFeatures(vector.getSource().getFeatures());
          console.log(json);
        }
      });
      mainbar.addControl ( save );


      // CanvasScaleLine control
      var scaleLineControl = new CanvasScaleLine();
      map.addControl(scaleLineControl);

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
    ></div>
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