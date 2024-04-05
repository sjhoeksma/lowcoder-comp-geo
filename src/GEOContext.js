/**
 * Object that contains the previewMode value which indicates if the app is in preview mode.
 * previewMode is set based on the existence of the lowcoderdev global.
 */
export const geoContext = {
    previewMode: document.lowcoderdev
}