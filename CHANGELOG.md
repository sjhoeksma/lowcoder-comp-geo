# ToDo

### Features
* Add left mouse event -> allow to popup
* Use Translate
* Add properties viewers for layers, buttons, features
* Implement kind of layers and do loading of baselayers first
* highlight the flyto feature
* add more data/layer sources likes mapbox stylegl and esri json
* how can we make layer styling more flexible and dynamic with or without legend in the map or outside the map component
* ability to select layer>feature from outside the component
* ability to filter the layer>data from outside the component
* fixed center point (mobile friendly) for a data collection (eg. https://pbdemo.mapseed.org/)
* Add support for more addFeature types
  WKT (Well-Known Text)
  WKB (Well-Known Binary)
  GeoJSON
  GML (Geography Markup Language)
  KML (Keyhole Markup Language)
  GPX (GPS Exchange Format)
  Shapefile
* Use lowcoder styling template where possible, or add it to styles
* Simplify the styling of the layer popup
* Add location point on home, not just a bounce circle
* Hide timeline layers from layer menu, and group the in on layergroup
* Check if is workable on mobile
* Animation for timeline
* Add the option to add custom buttons to the menubar locations and connect event
* UI components behavior should also be connected to the properties, ex: Date Hide when timeline in active
* Make a dynamic load layer, also for invisible layer or with a min zoom size set or linked to bbox
* Add control over the default behaviors
* Make timeline example with https://service.pdok.nl/hwh/luchtfotocir/wms/v1_0?request=GetCapabilities&service=wms
* implement cluster: https://openlayers.org/en/latest/examples/clusters-dynamic.html
* add the custom projections to the ui as property editor
* add option to control elements without the use of buttons
* add bookmark options https://viglino.github.io/ol-ext/examples/control/map.control.geobookmark.html
* add legend https://viglino.github.io/ol-ext/examples/legend/map.control.legends.html


### Bugs
* In Layers stylegl, fails when style is set, needs object creation

* ol-ext/interactions/UndoRedo throws to much console info local work around implemented
