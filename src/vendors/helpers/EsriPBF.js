import arcgisPbfDecode from 'arcgis-pbf-parser';
import GeoJSON from 'ol/format/GeoJSON';

/**
 * Represents a class for working with Esri PBF data.
 * Extends the GeoJSON class.
 */
class EsriPBF extends GeoJSON {
    getType() {
        return 'arraybuffer';
    }
    readFeature(source, options) {
        return super.readFeature(
            arcgisPbfDecode(new Uint8Array(source)).featureCollection,
            options
        );
    }
    readFeatures(source, options) {
        return super.readFeatures(
            arcgisPbfDecode(new Uint8Array(source)).featureCollection,
            options
        );
    }
}

export default EsriPBF;