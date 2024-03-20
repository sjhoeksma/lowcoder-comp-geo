/**
 * Animates the view to a given location.
 * 
 * @param {import('ol/View').default} view The view to animate. 
 * @param {number[]} coords The lon/lat coordinates to animate to.
 * @param {number} [duration=2000] The duration of the animation in milliseconds. 
 * @param {Object} [props] Additional properties for the view animation.
 */
import { fromLonLat } from 'ol/proj';

export function animateToLocation(view, coords, duration = 2000, props = { zoom: 15 }) {
  const location = fromLonLat(coords);
  view.animate(Object.assign({}, {
    center: location,
    duration: duration,
  }, props));
}

export const animations = {
  'toLocation': animateToLocation,
}

export function animate(name, view, coords, duration, props) {
  var func = animations[name || 'toLocation']
  if (func) func(view, coords, duration, props)
}