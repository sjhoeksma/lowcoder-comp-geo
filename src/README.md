# Using the Lowcoder GEO plugin

This plugin enables the usage of [Openlayers GEO viewer](https://openlayers.org/) within lowcoder. To use this plugin. Open your lowcoder environment goto the app. Select insert tab, extensions and plugins and add: **lowcoder-comp-geo**

# Documentation

We have created a [seperated documentation](https://sjhoeksma.github.io/lowcoder-comp-geo/) page explain all the features. 
[![documentation](https://github.com/sjhoeksma/lowcoder-comp-geo/blob/dev/images/documentation.png?raw=true)](https://sjhoeksma.github.io/lowcoder-comp-geo/)

# Example
To help you with understanding how you can use this plugin we have added an [example application](https://github.com/sjhoeksma/lowcoder-comp-geo/blob/main/lowcoder-example/lowcoder-comp-geo.json?raw=true). Just download the json application file and import it within lowcoder. 

#### Viewer
![viewer](https://github.com/sjhoeksma/lowcoder-comp-geo/blob/main/images/viewer-example.png?raw=true)

# Development

Before you start make your you have a up-to-date version on node installed locally.

Start with cloning the repository on to you local hard drive. Install all dependecies and start te component test environment. Make any changes to the code you want and the will be visible in the test environment. 

```bash
git clone https://github.com/sjhoeksma/lowcoder-comp-geo.git
cd lowcoder-comp-bpmn-io
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