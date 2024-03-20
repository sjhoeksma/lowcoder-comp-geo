import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';

// Adjusted to accept a map instance directly
export function showPopup(map, coordinates, message) {
    let popup = map.getOverlayById('infoPopup');
    if (!popup) {
        // Create popup overlay logic remains the same
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

    // Convert coordinates and set popup content
    // const coords = fromLonLat(coordinates);
    let content = popup.getElement().querySelector('.ol-popup-content');
    content.innerHTML = message;
    popup.setPosition(coordinates);
}
