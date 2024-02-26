

import React, { useState } from 'react';
import PropTypes from 'prop-types'

//The real GEO OpenLayers packages
import 'ol/ol.css';
import {Map, View} from 'ol/index.js';
import {Tile as TileLayer} from 'ol/layer.js';
import {XYZ} from 'ol/source';
//import ZoomSlider from 'ol/control/ZoomSlider.js';
import {fromLonLat} from 'ol/proj.js';
import {Control, defaults as defaultControls} from 'ol/control.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';



class RotateNorthControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(opt_options) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.innerHTML = 'N';

  
    const element = document.createElement('div');
    element.className = 'rotate-north ol-unselectable ol-control';
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    button.addEventListener('click', this.handleRotateNorth.bind(this), false);
  }

  handleRotateNorth() {
    this.getMap().getView().setRotation(0);
  }
}

function Geo(props) {
  const [geoRef, setGeoRef] = React.useState();
  const  geoId = Math.random().toString(16).slice(2);

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

      var map = new Map({
        controls: defaultControls().extend([new RotateNorthControl()]),
        view: new View({
          center:  fromLonLat(props.center),
          zoom: props.zoom,
          maxZoom: props.maxZoom, 
        }),
        target: 'GEO_'+ geoId,
        layers: [baseLayer,geoJson]
      });

      //Add the supported events
      map.on('loadend', function (event) {
        props.onLoadEnd(event)
      });
      map.on('click', function(event) {
        props.onClick(event)
      });
      map.getView().on('change:resolution', (event) => {
        //TODO:This event triggers on very small changes, shoud we limit it ?
        props.onZoom(event)
      });


      if (!props.showLogo) {
        //geoCanvas.getElementsByClassName('l7-control-logo')[0].style="display:none" 
      }
    }
  }, [geoRef, props.center,props.zoom,props.pitch,props.geoJson,
        props.showLogo,props.onDataChange]);

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
  pitch: PropTypes.number,
  geoJson: PropTypes.object,

  /*
  values: PropTypes.object,
  svgDownload : PropTypes.bool,
  imageName : PropTypes.string,
  designer : PropTypes.bool,
  */
  showLogo : PropTypes.bool,
  onDataChange: PropTypes.func,
  onLoadEnd: PropTypes.func,
  onClick: PropTypes.func,
  onZoom: PropTypes.func,
  skipRedraw: PropTypes.func,
}

export default Geo;