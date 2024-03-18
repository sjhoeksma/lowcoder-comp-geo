import { fromLonLat } from 'ol/proj';

export function animateToLocation(view, coords, zoom = 15, duration = 2000) {
  const location = fromLonLat(coords);
  view.animate({
    center: location,
    zoom: zoom,
    duration: duration,
  });
}