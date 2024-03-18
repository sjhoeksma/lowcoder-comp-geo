import { fromLonLat } from 'ol/proj';

export function animateToLocation(view, coords, duration = 2000) {
    const location = fromLonLat(coords);
    view.animate({
      center: location,
      duration: duration,
    });
}