# [1.3.0-dev.32](https://github.com/sjhoeksma/lowcoder-comp-geo/compare/v1.3.0-dev.31...v1.3.0-dev.32) (2024-03-22)


### Bug Fixes

* added events breaking event ([f916205](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/f916205d132367d1df2f8040b9e3def6fa67d184))
* buttons north and save ([cf01a72](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/cf01a72e8d526b4531b452416005f4a8740f6772))
* method feature and event ([508e7ed](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/508e7ed9ac7b7d3a81cd40fea212d0f84b4e9809))
* select correct current ([5615591](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/5615591aafd65a15c6050c16a6f338908d1830ea))

# [1.3.0-dev.31](https://github.com/sjhoeksma/lowcoder-comp-geo/compare/v1.3.0-dev.30...v1.3.0-dev.31) (2024-03-22)


### Bug Fixes

* added annimates ([1fb3466](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/1fb346654ec8515c0b80e69007f53921cd5c6e42))
* feature exposure ([5951e02](https://github.com/sjhoeksma/lowcoder-comp-geo/commit/5951e02e290d088867a437d1be2156dcb91c40b3))

## [ToDo]
- Make view mobile friendly, lager fonts for buttons
- Add left mouse menu
- Add configruation by definition single json file using query
- Add Layer Selection based on list
- Add method for notification, outside geo
- Use Translate
- Add properties viewers for layers, buttons, features
- Implement kind of layers and do loading of baselayers first
- method which will allow to load data into layer, instead of passing it by layer and can be bound to quer
- highlite the flyto feature
- add more data/layer sources likes mapbox stylegl and esri json
- how can we make layer styling more flexible and dynamic with or without legend in the map or outside the map component
- popup
- ability to select layer>feature from outside the component
- ability to filter the layer>data from outside the component
- fixed center point (mobile friendly) for a data collection (eg. https://pbdemo.mapseed.org/)
- Add support for more addFeature types
  WKT (Well-Known Text)
  WKB (Well-Known Binary)
  GeoJSON
  GML (Geography Markup Language)
  KML (Keyhole Markup Language)
  GPX (GPS Exchange Format)
  Shapefile
- Changes Event into Events and expose Event varaible as current_event
- Add functions in layers to convert string, object{lat,lon} to coordinates
- Add varaible exposing the last clicked feature as feature
