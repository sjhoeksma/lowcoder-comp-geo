/**
 * Animates the view to a given location.
 * 
 * @param {import('ol/View').default} view The view to animate. 
 * @param {number[]} coords The lon/lat coordinates to animate to.
 * @param {number} [duration=2000] The duration of the animation in milliseconds. 
 * @param {Object} [props] Additional properties for the view animation.
 */
import { fromLonLat, transform } from 'ol/proj';
import { getCenter } from 'ol/extent';
import { Stroke, Style, Fill } from 'ol/style'
import * as style from 'ol/style'
import { Feature } from 'ol';
import Zoom from 'ol-ext/featureanimation/Zoom'
import { Point } from 'ol/geom'
import * as easing from 'ol/easing';

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

export function animateToLocation(map, coords, duration, props = {}) {
  const location = fromLonLat(coords);
  return map.getView().animate(Object.assign({ zoom: 15 }, {
    center: location,
    duration: duration,
  }, props), props.callback);
}

export function animateToExtent(map, coords, duration, props = {}) {
  const geographicCenter = getCenter(coords);
  const location = fromLonLat(geographicCenter);
  map.getView().animate(Object.assign({ zoom: 15 }, {
    center: location || fromLonLat(coords),
    duration: duration,
  }, props), props.callback);
}


// Pulse feature at coord
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

export function animatePulse(map, coords, duration, props = {}) {
  var count = props._pulseCount ? props._pulseCount : props._easing == "bounce" ? 1 : 3;
  for (var i = 0; i < count; i++) {
    setTimeout(function () {
      pulseFeature(map, coords, duration, props);
    }, i * 500);
  };
}

export function animateHome(map, coords, duration, props = {}) {
  animateToLocation(map, coords, props.locDuration || duration,
    Object.assign(props, {
      'callback': () => {
        animatePulse(map, coords, duration, props)
      }
    })
  )
}

export const animations = {
  'toLocation': animateToLocation,
  'toExtent': animateToExtent,
  'pulse': animatePulse,
  'home': animateHome,
}

export function animate(map, coords, duration = 2000, props = {}, name) {
  var func = animations[name || 'toLocation']
  if (func) func(map, parseCoords(coords), duration, props)
}