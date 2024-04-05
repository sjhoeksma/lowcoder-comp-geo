import { fromLonLat, transform } from 'ol/proj';
import { getCenter } from 'ol/extent';
import { Stroke, Style, Fill } from 'ol/style'
import * as style from 'ol/style'
import { Feature } from 'ol';
import Zoom from 'ol-ext/featureanimation/Zoom'
import { Point } from 'ol/geom'
import * as easing from 'ol/easing';

const emptyCallback = function () { }

/**
 * Parses a coordinate value and returns an array of [longitude, latitude].
 * Handles stringified JSON, array, and object coordinate formats.
 * @param {array/string/json} coords The coords to parse.
 * Returns empty array if unable to parse coordinates.
 */
export function parseCoords(coords) {
  if (!coords) return []
  try {
    if (typeof coords === 'string') coords = JSON.parse(coords)
  } catch (e) { }
  try {
    if (typeof coords === 'string') coords = JSON.parse("[" + coords + "]")
  } catch (e) { }
  if (Array.isArray(coords)) return coords
  if (coords.longitude) return [coords.longitude, coords.latitude]
  return coords
}

/**
 * Animates the map view to the given coordinates.
 * 
 * @param {ol.Map} map The map to animate.
 * @param {number[]} coords The longitude and latitude of the location to animate to. 
 * @param {number} [duration=2000] Duration of the animation in milliseconds.
 * @param {Object} [props] Additional properties for the view animation.
 */
export function animateToLocation(map, coords, duration, props = {}) {
  const location = fromLonLat(coords);
  return map.getView().animate(Object.assign({ zoom: 15 }, {
    center: location,
    duration: duration,
  }, props), props.callback || emptyCallback);
}

/**
 * Animates the map view to center on the given extent. 
 * 
 * @param {ol.Map} map The map to animate
 * @param {number[]} coords The extent to animate to as [minx, miny, maxx, maxy]
 * @param {number} [duration=2000] Duration of animation in milliseconds
 * @param {Object} [props] Additional properties for the view animation
 */
export function animateToExtent(map, coords, duration, props = {}) {
  const geographicCenter = getCenter(coords);
  const location = fromLonLat(geographicCenter);
  map.getView().animate(Object.assign({ zoom: 15 }, {
    center: location || fromLonLat(coords),
    duration: duration,
  }, props));
}



/**
 * Animates a pulsing effect on the provided feature coordinate.
 * 
 * @param {ol.Map} map The map to animate on.
 * @param {number[]} coords The longitude and latitude of the feature to pulse.
 * @param {number} [duration=3000] Duration of the pulse animation in milliseconds.
 * @param {Object} [props] Additional properties for the animation.
 */
export function pulseFeature(map, coords, duration, props = {}) {
  props = Object.assign({ _easing: "upAndDown", _style: "Circle", _color: "red" }, props)
  //const location = fromLonLat(coords);
  const location = transform(coords, 'EPSG:4326', map.getView().getProjection())
  //Bounce
  var bounce = 5;
  var a = (2 * bounce + 1) * Math.PI / 2;
  var b = -0.01;
  var c = -Math.cos(a) * Math.pow(2, b);

  const _bounce = function (t) {
    t = 1 - Math.cos(t * Math.PI / 2);
    return (1 + Math.abs(Math.cos(a * t)) * Math.pow(2, b * t) + c * t) / 2;
  }

  var f = new Feature(new Point(location));
  f.setStyle(new Style({
    image: new style[props._style]({
      radius: 40,
      points: 4,
      src: props.image || "../../../assets/Marker.svg",
      //fill: new Fill({ color: 'white' }),
      stroke: new Stroke({ color: props._color, width: 2 })
    })
  }));

  map.animateFeature(f, new Zoom({
    zoomOut: false,
    fade: easing.easeOut,
    duration: duration || 3000,
    easing: props._easing == "bounce" ? bounce : easing[props._easing]
  }))
}

/**
 * Animates a pulsing effect by calling pulseFeature multiple 
 * times with a delay between each call.
 * 
 * @param {ol.Map} map - The map to animate on.
 * @param {number[]} coords - The longitude and latitude to pulse. 
 * @param {number} [duration=3000] - Duration of each pulse.
 * @param {Object} [props] - Additional properties for the animation.
 */
export function animatePulse(map, coords, duration, props = {}) {
  var count = props._pulseCount ? props._pulseCount : props._easing == "bounce" ? 1 : 3;
  for (var i = 0; i < count; i++) {
    setTimeout(function () {
      pulseFeature(map, coords, duration, props);
    }, i * 500);
  };
}

/**
 * Animates panning to a location, then animates a pulse effect.
 * 
 * @param {ol.Map} map - The map to animate on.
 * @param {number[]} coords - The longitude and latitude to pan and pulse to.
 * @param {number} duration - Duration of the pulse animation.  
 * @param {Object} [props] - Additional properties for the animations.
 */
export function animateHome(map, coords, duration, props = {}) {
  animateToLocation(map, coords, props.locDuration || duration,
    Object.assign(props, {
      'callback': () => {
        animatePulse(map, coords, duration, props)
      }
    })
  )
}

/**
 * Object containing animation helper functions that can be called to 
 * animate the map in different ways.
 */
export const animations = {
  'toLocation': animateToLocation,
  'toExtent': animateToExtent,
  'pulse': animatePulse,
  'home': animateHome,
}

/**
 * Animates the map view in some way by calling one of the animation helper functions.
 * @param {ol.Map} map - The map to animate
 * @param {number[]} coords - The map coordinates (longitude, latitude) to animate to
 * @param {number} [duration=2000] - Duration of the animation in milliseconds 
 * @param {Object} [props] - Additional properties to pass to the animation function
 * @param {string} [name] - Name of the animation function to call (default 'toLocation')
 */
export function animate(map, coords, duration = 2000, props = {}, name) {
  var func = animations[name || 'toLocation']
  if (func) func(map, parseCoords(coords), duration, props)
}