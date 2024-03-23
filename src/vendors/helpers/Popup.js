/**
 * Shows a popup overlay on the provided map at the given coordinates 
 * with the specified content message. Creates the popup if it does not 
 * already exist.
 */
import Overlay from 'ol/Overlay';
import { getCenter } from 'ol/extent';
import { fromLonLat, transformExtent } from 'ol/proj';

// Adjusted to accept a map instance directly
export function showPopup(map, coordinates, message) {
    let popup = map.getOverlayById('infoPopup');
    if (!popup) {
        // Create popup overlay logic
        let popupElement = document.createElement('div');
        popupElement.className = 'ol-popup';

        let closer = document.createElement('a');
        closer.className = 'ol-popup-closer';
        closer.href = '#';
        popupElement.appendChild(closer);

        let content = document.createElement('div');
        content.className = 'ol-popup-content';
        popupElement.appendChild(content);

        closer.onclick = function () {
            popup.setPosition(undefined);
            closer.blur();
            return false;
        };

        popup = new Overlay({
            element: popupElement,
            autoPan: true,
            autoPanAnimation: { duration: 250 },
            id: 'infoPopup'
        });

        map.addOverlay(popup);
    }

    if (Array.isArray(coordinates)) {
        // If coordinates have more than two values, assume it's an extent and calculate its center.
        if (coordinates.length > 2) {
            coordinates = getCenter(transformExtent(coordinates, 'EPSG:4326', map.getView().getProjection()));
        }
        else if (coordinates.length < 3) {
            coordinates = fromLonLat(coordinates);
        }
        // Now coordinates will always be a pair here, suitable for setPosition.
        let content = popup.getElement().querySelector('.ol-popup-content');
        content.innerHTML = message;
        popup.setPosition(coordinates);
    }
}
