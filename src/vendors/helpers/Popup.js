/**
 * Shows a popup overlay on the provided map at the given coordinates 
 * with the specified content message. Creates the popup if it does not 
 * already exist.
 */
import Overlay from 'ol/Overlay';
import { getCenter } from 'ol/extent';
import { fromLonLat, transformExtent } from 'ol/proj';
import { object } from 'prop-types';


function getMapPopup(map, name) {
    let popup = map.getOverlayById(name);
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
            id: name
        });

        map.addOverlay(popup);
    }
    return popup
}
/**
 * Shows a popup overlay on the provided map at the given coordinates
 * with the specified content message. Creates the popup if it does not
 * already exist.
 * 
 * @param {ol.Map} map The map to show the popup on.
 * @param {ol.Coordinate|ol.Extent} coordinates The popup location as a coordinate pair or extent.
 * @param {string} message The HTML content for the popup.
 */
export function showPopup(map, coordinates, message) {
    let popup = getMapPopup(map, 'infoPopup');

    if (coordinates && !Array.isArray(coordinates) && coordinates.extent) {
        coordinates = coordinates.extent
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


/**
 * Shows a popup with feature properties in a table. 
 * Called on map click events. Checks for feature at click location, 
 * gets its properties, formats them in a table, 
 * and shows in a popup at the click location.
 * 
 * @param  map The map to show the popup on.
 * @param  event The feature click event
*/
export function featurePopup(map, evtObj, title) {
    let tableHTML = '<tr><th>Property</th><th>Value</th></tr>';
    // Exclude the geometry property and iterate over the remaining properties
    delete evtObj.properties.geometry; // Remove geometry property
    for (const [key, value] of Object.entries(evtObj.properties)) {
        tableHTML += `<tr><td>${key}</td><td>${value}</td></tr>`;
    }
    // Now coordinates will always be a pair here, suitable for setPosition.
    showPopup(map, evtObj, `${title}<table style="border:1">${tableHTML}</table>`)
}