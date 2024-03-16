import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';

export const lightStroke = new Style({
    stroke: new Stroke({
      color: [255, 255, 255, 0.6],
      width: 2,
      lineDash: [4,8],
      lineDashOffset: 6
    })
  });
  
export const darkStroke = new Style({
    stroke: new Stroke({
      color: [0, 0, 0, 0.6],
      width: 2,
      lineDash: [4,8]
    })
  });

export const geoJsonStyle =  new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 3,
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)',
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: 'blue',
      }),
    })
});

export const selectedStyle = new Style({
  fill: new Fill({
    color: '#eeeeee',
  }),
  stroke: new Stroke({
    color: 'rgba(255, 255, 255, 0.7)',
    width: 2,
  }),
});