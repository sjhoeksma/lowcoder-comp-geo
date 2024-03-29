# GEOComp Component

The `src` directory contains the source code for the GEOComp React component. GEOComp renders an interactive geographic map using the OpenLayers library.

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
- `vendors/index.ts` - OpenLayers map initialization and helpers
- `styles.module.css` - Component styling

## Component Configuration

GEOComp is configured through React props that control the map options and layers. Some key configuration props:

- `center` - Initial center point [lon, lat]
- `zoom` - Initial zoom level
- `layers` - Array of layer configuration objects
- `events` - Object mapping event names to handlers
- `feature` - Selected/edited feature state  

## Events and Interactivity

GEOComp exposes events that can be handled in the parent component:

- `onInit` - Map initialized
- `onLoad` - Layers loaded
- `onClick` - Map clicked
- `onSelect` - Feature clicked
- `onModify` - Draw layer edited

This allows integrating custom popup content, selection logic, etc.

## Styling

GEOComp uses CSS modules for styling control. The `styles` prop accepts configuration for:

- Padding
- Text sizing
- Background color 
- Borders
- Border radius

This allows adapating the visual style.

# Building the plugin

Before you start make your you have a up-to-date version on node installed locally.

Start with cloning the repository on to you local hard drive. Install all dependecies and start te component test environment. Make any changes to the code you want and the will be visible in the test environment. 

```bash
git clone https://github.com/sjhoeksma/lowcoder-comp-geo.git
cd lowcoder-comp-geo
yarn install
yarn start
```

When you are finished you can build your own version or deploy it to npmjs

```bash
# Building
yarn build 
# Or Publishing
yarn build --publish
```