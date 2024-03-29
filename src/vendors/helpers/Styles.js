
/**
 * Provides OpenLayers style configurations for various geometries.
 * 
 * This module includes predefined styles and a dynamic style function
 * for GeoJSON features based on their properties. It supports styling
 * for Point, LineString, MultiLineString, Polygon, and MultiPolygon geometries.
 * The styles can be customized by specifying feature properties such as
 * stroke color, stroke width, fill color, and marker size.
 * 
 * The predefined styles include lightStroke, darkStroke, and geoJsonStyle for
 * basic styling needs. Additionally, the module offers a selectedStyle for
 * highlighting selected features.
 * 
 * The geoJsonStyleFunction dynamically generates styles for GeoJSON features
 * according to their properties, allowing for individual feature customization
 * and adherence to the GeoJSON standard styling. If a feature does not have
 * specific styling properties defined, default styles are applied.
 * 
 * Usage:
 * To apply these styles, assign the style function or a specific style
 * directly to the style property of an OpenLayers layer.
 */

import { Style, Stroke, Fill, Circle as CircleStyle, Text } from 'ol/style';

/**
 * Represents a light stroke style.
 * @type {Style}
 */
export const lightStroke = new Style({
  stroke: new Stroke({
    color: [255, 255, 255, 0.6],
    width: 2,
    lineDash: [4, 8],
    lineDashOffset: 6
  })
});

/**
 * Represents a dark stroke style.
 * @type {Style}
 */
export const darkStroke = new Style({
  stroke: new Stroke({
    color: [0, 0, 0, 0.6],
    width: 2,
    lineDash: [4, 8]
  })
});

/**
 * Function to dynamically style GeoJSON features based on their properties.
 * @param {ol.Feature} feature - The GeoJSON feature to style.
 * @returns {Style} The style for the given feature.
 */
export const geoJsonStyleFunction = (feature) => {
  // Extract properties from the feature
  const properties = feature.getProperties();
  const geometryType = feature.getGeometry().getType();

  // Define default styles
  let strokeColor = 'blue';
  let strokeWidth = 3;
  let fillColor = 'rgba(0, 0, 255, 0.1)';
  let circleRadius = 7;
  let circleFillColor = 'blue';

  // Override default styles with feature-specific properties, if available
  if (properties['stroke']) strokeColor = properties['stroke'];
  if (properties['stroke-width']) strokeWidth = properties['stroke-width'];
  if (properties['fill']) fillColor = properties['fill'];
  if (properties['marker-color']) circleFillColor = properties['marker-color'];
  if (properties['marker-size'] === 'medium') circleRadius = 10; // Adjust size based on property

  // Create styles based on geometry type
  switch (geometryType) {
    case 'Point':
      return new Style({
        image: new CircleStyle({
          radius: circleRadius,
          fill: new Fill({
            color: circleFillColor,
          }),
        }),
      });
    case 'LineString':
    case 'MultiLineString':
      return new Style({
        stroke: new Stroke({
          color: strokeColor,
          width: strokeWidth,
        }),
      });
    case 'Polygon':
    case 'MultiPolygon':
      return new Style({
        stroke: new Stroke({
          color: strokeColor,
          width: strokeWidth,
        }),
        fill: new Fill({
          color: fillColor,
        }),
      });
    default:
      // Default style for other geometries
      return new Style({
        stroke: new Stroke({
          color: 'gray',
          width: 1,
        }),
        fill: new Fill({
          color: 'rgba(128, 128, 128, 0.1)',
        }),
      });
  }
};

/**
 * Represents a selected style.
 * @type {Style}
 */
export const selectedStyle = new Style({
  fill: new Fill({
    color: '#eeeeee',
  }),
  stroke: new Stroke({
    color: 'rgba(255, 255, 255, 0.7)',
    width: 2,
  }),
});