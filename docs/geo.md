# Geo Component

This directory contains a React component called `Geo` that renders an interactive map using [OpenLayers](https://openlayers.org/).

## Overview

The `Geo` component provides a wrapper around an OpenLayers map to make it easy to integrate into a React application. It handles initializing the map, layers, controls, and other features based on props passed to it. 

The component monitors map events and bubbles them up to the parent component via callback props like `onEvent`. This allows the parent to respond to map interactions.

The `Geo` component also supports dynamically updating the map by changing the props it receives. This allows features like layers, controls, and interactions to be added, removed, or updated on the fly.

## Functionality

The key capabilities of the `Geo` component include:

- Renders an OpenLayers map in a React component
- Initializes map view, controls, layers, interactions based on props
- Supports vector, tile, image, and overlay layer types
- Adds various pre-configured controls like Zoom, FullScreen, LayerSwitcher
- Handles OpenLayers map events and bubbles them up to parent 
- Allows map features to be dynamically updated by changing props
- Provides helper methods for working with layers, geoJSON, etc.

The `Geo` component aims to handle the OpenLayers map initialization and management so the parent component can focus on data, state, UI, etc.

## Key Files

- `Geo.jsx`: Main React component that renders the map 
- `helpers/index.js`: Helper utilities for map interactions
- `RotateNorthControl.js`: Custom control example
- `styles.css`: CSS styles for map elements

## Usage

The `Geo` component takes a `props` object with configuration like:

```jsx
<Geo
  center={[0, 0]}
  zoom={2}
  features={{ zoom: true }}
  layers={[ 
    {
      name: 'Countries',
      type: 'geojson',
      source: countryGeoJson
    }
  ]}
/>
```

It can be used like any other React component. See the code comments for details on all the supported props.

The parent component is notified of map events via the onEvent callback prop. It can update features like layers by passing new props to Geo.

## Additional Details
- Uses OpenLayers v9+ and ol-ext library
- Requires CSS imports of OpenLayers and ol-ext styles
- Works well with React hooks for state management
- helpers contains useful utilities for working with OpenLayers
- Can be extended by creating custom OpenLayers controls
- See the code and comments for more implementation details.The OpenLayers docs provide additional reference.