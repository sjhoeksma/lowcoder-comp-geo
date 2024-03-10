

import React, { useState } from 'react';
import PropTypes from 'prop-types'

//The real GEO OpenLayers packages
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import {Map, View} from 'ol/index';
import {Tile as TileLayer} from 'ol/layer';
import {XYZ} from 'ol/source';
//import ZoomSlider from 'ol/control/ZoomSlider.js';
import {fromLonLat} from 'ol/proj';
import {Control, defaults as defaultControls, FullScreen, Zoom } from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeolocationBar from 'ol-ext/control/GeolocationBar'
import OSM from 'ol/source/OSM'
import CanvasScaleLine from 'ol-ext/control/CanvasScaleLine'
import Notification from 'ol-ext/control/Notification'

function Geo(props) {
  const [geoRef, setGeoRef] = React.useState();
  const geoId = Math.random().toString(16).slice(2);

  const variants = [
    'standaard',
		'pastel',
		'grijs',
		'water',
  ];

  var varaint = variants[0]
 
  const useGeoRef = React.useCallback(ref => {
    setGeoRef(ref);
  }, []);
  
  React.useEffect(() => {
    if (geoRef && !props.skipRedraw()) {
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
          center:  fromLonLat((props.center.length==2 ? props.center : props.defaults.center) || []),
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
      props.onDataChange,props.onLoadEnd,props.onZoom,props.defaults
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