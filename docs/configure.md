# Configuration options

## Layers on the Map

<img align="right" src="images/config-map2.png">
<img align="right" src="images/config-map1.png" >
Map is the first property section you should configure. It's the base and any configuration made here will redraw the geo component.

Layers are the hart of any GEO application. By default we provide a number of examples layers as you can see in the left figure. By clicking de `+Add` button you can add a new layer or by clicking on `...` you can delete or duplicate a layer.

By dragging a layer items up or down you can change the `order` of the layer, if it is not defined within the layer properties.

Be careful not to add to many layers because in some cases all data is loaded before showing. Some layer technics will load different data when the viewpoint or zoom has changed. You as a developer can also can reduce the data loading by for example catching the `onBbox` from within *interaction* and based on the `geo1.bbox` only load features within this bbox by calling `geo1.addFeatures('layer',{a GEOJson})`

There are many places where you can find open data sources serving information GEO data. For a starting point look at this [Wiki Page](https://en.wikipedia.org/wiki/List_of_GIS_data_sources) 
<br clear="right"/>

### Options

|Level|Option|Description|
|---|---|---|
|Map|Layers|An draggable array containing all layers||
||Center|Coordinates [longitude,latitude] to center the map on when loading. When empty and behavior `GPS location on Startup` is `on` it will center on your current position|
||Zoom|The initial zoom you want to use. Where `0` is worldwide, `6` a country, `10` is region and `18` street level|
||Max Zoom|The `default` maximum zoom allowed for a layer. Can be overruled within a layer|
||Rotation|The rotation of a map. Defaults to `0` north. By enabling behavior `Rotate map North` a button will be added to map allowing user to set rotation to `North`|
||Projection|The projection of all features shown on the map|
|Edit|Name|The name of the layer. This name is used by `Methods` to find the correct layer and should therefor be unique|
||Title|The title of the layer shown in layer-menu on map. You will need to set behavior `Show Layers` to `on` to see the layer-menu button.|
||Type|The type of the GEO layer. Changing this type will change the *Source* properties.| 
||Type [`mvt`]|A `VectorTileSource` containing `MVT` data| 
||Type [`wms`]|A `TileLayer`  containing `TileWMS` data| 
||Type [`wfs`]|A `VectorLayer` containing `Vector` data by `url`| 
||Type [`xyz`]|A `TileLayer` containing `XYZ` data| 
||Type [`geojson`]|A `VectorLayer` containing `Vector` data by `data object`| 
||Type [`cog`]|A `TitleLayer` containing `GEOTiff` data| 
||Type [`stylegl`]|A `VectorTileLayer` containing `VectorSourceTile` data | 
||Type [`arcgis-mapserver-tile`]|A arcgis `TileLayer` containing `TileArcGISRest` data| 
||Type [`arcgis-mapserver-image`]|A arcgis 'ImageLayer' containing `ImageArcGISRest` data | 
|Source|Data [`geojson`]|An `object` or `string` containing a GEOJson describing the features to load. You can use a result of a static query here `{{query1.data}}`, but be careful with update, because it will update the entire map. For dynamic updates use the method `geo1.addFeatures('layer',{})`|
||Projection [`geojson`,`cog`,`stylgl`]|The projection of the data used|
||Url [`mvt`,`wms`,`wfs`,`xyz`,`cog`,`stylegl`,`arcgis-mapserver-tile`,`arcgis-mapserver-image`]|The url for the source map data|
||Attributions [`mvt`]|The Attributions used|
||Params [`wms`,`arcgis-mapserver-tile`,`arcgis-mapserver-image`]|The parameters used|
||ServerType [`wms`]|Sever type|
||CrossOrigin [`wms`,`arcgis-mapserver-tile`,`arcgis-mapserver-image`]|CrossOrigin options|
||TileSize [`cog`]|Size of the tile|
||Nodata [`cog`]|Nodata property|
||Style [`stylegl`]|Style settings used within for the layer|
||Ratio [`arcgis-mapserver-image`]|Rotation in degrees of map|
|Settings|Visible|Is the layer visible in the viewer, can be changed by user in the layer-menu|
||Selectable|Are features on this map selectable by user|
||Visible in layer menu|Is this layer visible in the layer-menu|
||Min Zoom|The minimal zoom of the layer|
||Max Zoom|The maximal zoom of the layer|
||Opacity|The opacity of the layer, `0 = 0%` and `1 = 100%`|
||Group(s)|`String` or `Array of Strings` containing the groups this layer belongs to|
||Splitscreen|By settings `left` or `right` this layer will be visible in splitscreen mode on the left or right side of the split. You can select multiple layers on left and right|
||Timeline|When you set here a `year/date` this layer will be added to the timeline|

## Interaction

<img align="right" src="images/config-interaction.png" >
Interaction will help 
<br clear="right"/>

### Options
|Option|Description|
|---|---|

## Menu

<img align="right" src="images/config-menu.png" >
<br clear="right"/>

### Options
|Option|Description|
|---|---|

## Timeline

<img align="right" src="images/config-timeline.png" >
<br clear="right"/>

### Options
|Option|Description|
|---|---|

## Styles

<img align="right" src="images/config-styles.png" >
<br clear="right"/>

### Options
|Option|Description|
|---|---|

## Behavior

<img align="right" src="images/config-behavior.png" >
<br clear="right"/>

### Options
|Option|Description|
|---|---|

## Component

### Variables
|Variable|Description|
|---|---|


### Methods
|Method|Parameters|Description|
|---|---|---|

