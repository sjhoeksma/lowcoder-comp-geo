# GEOComp Component

The `src` directory contains the source code for the GEOComp react component creating the Lowcoder plugin. GEOComp providers configuration features for the GEO react component which renders an interactive geographic map using the OpenLayers library.

## Overview

GEOComp is a reusable map component that can be configured and integrated into other applications. It allows displaying geographic data layers, interactivity through popups and drawing, and exposes events for integrating custom functionality.

Some key capabilities provided by GEOComp:

- Configurable base map layers
- Overlay vector data layers from files or API sources  
- Interaction through popups, selection, and drawing tools
- Expose map events and selected features
- Timeline animation of temporal data
- Customizable styling

## Key Files

Within the main directory you will find the following files creating the lowcoder plugin

- `GEOComp.tsx` - Main component definition and configuration
- `LayersControl.tsx` - Builds layer configuration UI
- `FeaturesControl.tsx` - Feature flags configuration  
- `vendors/Geo.jsx` - The implementation of the GEO react component
- `styles.module.css` - Component styling

## Component Configuration

GEOComp is configured through React props that control the map options and layers. Some key configuration props:

Map
- `layers` - Array of layer configuration objects
    - `label` - Display label for layer
    - `title` - Layer menu text 
    - `type` - Layer type dropdown (mvt, wms, etc)
    - `source` - Layer source settings
        - `url`: The URL of the tile or image service 
        - `attributions`: Attribution text for the layer
        - `params`: Additional parameters for the service request
        - `serverType`: The type of WMS server (geoserver, mapserver, etc)
        - `crossOrigin`: Whether to request cross-origin access when fetching the layer
        - `data`: The GeoJSON data object for a vector layer 
        - `projection`: The projection of the vector data
        - `tileSize`: Tile size for COG layers
        - `nodata`: Nodata value to use for COG layers 
        - `ratio`: Scaling ratio for ArcGIS MapServer images
    - `visible` - Is layer visible initially
    - `selectable` - Can layer be toggled on/off
    - `userVisible` - Is layer visible to user
    - `order` - Display order in layers list
    - `minZoom` - Minimum zoom level to show layer
    - `maxZoom` - Maximum zoom level to show layer
    - `opacity` - Layer opacity
    - `groups` - Layer groups
    - `splitscreen` - Split screen position (no, left, right) 
    - `timeline` - Timeline year/date of layer
- `center` - Initial center point [lon, lat]
- `zoom` - Initial zoom level
- `maxZoom` - Initial maximum zoom level
- `minZoom` - Initial minimum zoom level

Interaction
- `events` - Object mapping event names to handlers

Menu
- `title` - Title used within menu
- `content` - Content of the menu used
- `feature` - Selected/edited feature state 

Timeline
- `Start Date` - Start Year/Date of the timeline
- `End Date` - End Year/Date of the timeline

Style
- Padding
- Text sizing
- Background color 
- Borders
- Border radius

Behavior
- `menu` - Whether to show the menu icon.
- `zoom` - Show zoom buttons.
- `fullscreen` - Show fullscreen toggle.
- `layers` - Show layer visibility toggles.
- `center` - Show map center button.
- `modify` - Allow geometry editing.
- `save` - Show save button.
- `splitscreen` - Allow split screen.
- `tracker` - Show tracker options.
- `timeline` - Show timeline slider.
- `gpsCentered` - Center map on user's location.
- `north` - Show north button to reset bearing.
- `scale` - Show map scale display.
- `largeButtons` - Use large toolbar icons.
- `scaleToBottom` - Put scale on bottom of toolbar.
- `"modify:move"` - Allow moving geometries.
- `"modify:point"` - Allow editing points.
- `"modify:line"` - Allow editing lines. 
- `"modify:oval"` - Allow editing ovals.
- `"modify:polygon"` - Allow editing polygons.
- `"modify:delete"` - Show delete geometry button.
- `"modify:redo"` - Show redo button.
- `"modify:undo"` - Show undo button.
- `"splitscreen:horizontal"` - Allow horizontal split screen.
- `"splitscreen:vertical"` - Allow vertical split screen.
- `debug` - Enable debug messages.


## Events and Interactivity

GEOComp exposes events that can be handled in the parent component:

- `onInit` - Map initialized
- `onLoad` - Layers loaded
- `onModify` - User modifies feature on map
- `onTimeline` - User interacts with timeline 
- `onClick` - Map clicked
- `onSelect` - Feature clicked
- `onBbox` - The bbox of the map changed
- `onZoom` - Fires when the zoom has changed
- `onEvent` - Eventhandler for all other events

This allows integrating custom popup content, selection logic, etc.

## Exposed Methods

### animate

Perform animation

**Parameters:**

- `coords` (JSONValue): Coordinates for animation
- `duration` (number): Duration of animation
- `properties` (JSON): Properties for feature
- `animation` (string): Type of animation (toLocation,toExtent,pulse,home)

### map

Return the last map object

**Parameters:**

None

### notify

Notify message

**Parameters:** 

- `message` (string): Notification message
- `duration` (number): Display duration

### showPopup

Displays a popup at the specified coordinates with a given message

**Parameters:**

- `coordinates` (JSONValue): Coordinates where the popup should appear 
- `message` (string): Message to display in the popup

### setFeatures

Add feature to layer

**Parameters:**

- `data` (JSONValue): GeoJSON feature(s) to add 
- `layer` (string): Layer name
- `clear` (boolean, optional): Clear layer first if true

### getFeatures 

Get features from layer

**Parameters:**

- `layer` (string): Layer name

### clearFeatures

Clear features from layer

**Parameters:**

- `layer` (string): Layer name

### setConfig

Set configuration the plugin by json

**Parameters:**

- `json` (JSONValue): Config object
- `filter` (JSONValue): Layer Filter to apply

### getConfig

Get configuration the plugin by json

**Parameters:**

- `filter` (JSONValue): Layer Filter to apply
