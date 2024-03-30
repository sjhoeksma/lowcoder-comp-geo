# [1.3.0-dev.73](https://github.com/sjhoeksma/lowcoder-comp-geo/compare/v1.3.0-dev.72...v1.3.0-dev.73) (2024-03-30)


### Bug Fixes

* crash on empty GEOJson in data ([43c0809](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/43c08090a68b1fb2e7c1ae3153e813647ecd604d))

# [1.3.0-dev.72](https://github.com/sjhoeksma/lowcoder-comp-geo/compare/v1.3.0-dev.71...v1.3.0-dev.72) (2024-03-30)


### Bug Fixes

* Autoheight to boolean ([62fc85e](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/62fc85e83806011d361ba815728c7029b531787b))
* removed documentation ([9cab07c](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/9cab07c3b45ed779b874b673b30c63cafc7e1158))

# [1.3.0-dev.71](https://github.com/sjhoeksma/lowcoder-comp-geo/compare/v1.3.0-dev.70...v1.3.0-dev.71) (2024-03-30)


### Bug Fixes

* Autoheight by default ([0c64c8e](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/0c64c8ef813c4e69d919d8b540528b6ecc221ae0))
* remove jsdoc ([946d007](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/946d0079dbc0a9dab0c697e6a816fb4443d77b1b))
* remove JSDOC full ([3696a4f](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/3696a4fac53a1ff42585cd7f854b1b03fc79696e))

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
* Update documentation
* Add removeFeatures to method
* Block undo/redo stack when performing addFeatures/removeFeatures/clearFeatures
* Use lowcoder styling template where possible, or add it to styles
* Simplify the styling of the layer popup
* Add location point on home, not just a bounce circle
* Implement timeline function and layer types
* Hide timeline layers from layer menu, and group the in on layergroup
* Check if is workable on mobile
* Problem with changing drawlayer, will not setFeatures
* Loading of JSON not working

### Bugs
* In Layers stylegl, fails when style is set, needs object creation
