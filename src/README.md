# Using the Lowcoder GEO plugin

This plugin enables the usage of [Openlayers GEO viewer](https://openlayers.org/) within lowcoder. To use this plugin. Open your lowcoder environment goto the app. Select insert tab, extensions and plugins and add: **lowcoder-comp-geo**

Edit properties explained:
* Add bullet


# Example
To help you with understanding how you can use this plugin we have added an [example application](https://github.com/sjhoeksma/lowcoder-comp-geo/blob/main/examples/lowcoder-comp-geo.json?raw=true). Just download the json application file and import it within lowcoder. The two images below show the difference between designer and viewer. Within the viewer you see the variable replacement working. 

#### Designer 
![designer](https://github.com/sjhoeksma/lowcoder-comp-geo/blob/main/images/designer-example.png?raw=true)

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