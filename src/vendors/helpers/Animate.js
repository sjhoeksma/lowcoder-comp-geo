import { fromLonLat } from 'ol/proj';

export function animateToLocation(view, coords, duration = 2000, props = {zoom:15}) {
  const location = fromLonLat(coords);
  view.animate({
    center: location,
    zoom: props.zoom,
    duration: duration,
  });
}

export const animations = {
  'toLocation' : animateToLocation,
}

export function animate(name,view, coords,duration, props){
    var func = animations[name]
    if (func) func(view, coords, props, duration)
}