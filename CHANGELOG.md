# [1.3.0-dev.74](https://github.com/sjhoeksma/lowcoder-comp-geo/compare/v1.3.0-dev.73...v1.3.0-dev.74) (2024-03-31)

### Bug Fixes

* added .vscode to ignore ([601280c](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/601280c7d90258b3ad2b097e7c02a6c76d29c31e))
* default feature object ([cc32a54](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/cc32a54a0d64cd9375652d125898cef8761a56f8))
* getView ([772a88e](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/772a88e13bbd4b7c9a2c8721045342314cf9f69c))
* Reduced the number of redraws ([3ee8043](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/3ee804380b9854e900a66e651aaede394aa5e24a))
* return promise ([7f8e18b](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/7f8e18b4908c2b6921f0a6d878648fceb933defc))
* upgraded node-modules ([82afb23](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/82afb23f175ce183f732c61eed6f146e85235f6c))

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
* Use lowcoder styling template where possible, or add it to styles
* Simplify the styling of the layer popup
* Add location point on home, not just a bounce circle
* Hide timeline layers from layer menu, and group the in on layergroup
* Check if is workable on mobile
* Animation for timeline
* Add the option to add custom buttons to the menubar locations and connect event
* Install jsdoc in dev, run jsdocs, copy create md files of it under docs, remove jdocs


### Bugs
* In Layers stylegl, fails when style is set, needs object creation
