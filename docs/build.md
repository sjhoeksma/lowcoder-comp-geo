# Extending or Contributing to this plugin

Before you start make your you have a up-to-date version on node installed locally. 
We welcome you to extend or fix buges on the plugin. Please raise a pull request.

## Cloning the repository
Start with cloning the repository on to you local hard drive. Install all dependecies and start te component test environment. Make any changes to the code you want and the will be visible in the test environment. 

```bash
git clone https://github.com/sjhoeksma/lowcoder-comp-geo.git
cd lowcoder-comp-geo
yarn install
yarn start
```

## Building a npm release
When you are finished you can build your own version or deploy it to npmjs

```bash
# Building
yarn build 
# Or Publishing
yarn build --publish
```

## Showing documentation and validating
The documentation is created with docsify and is located within the docs directory. 
When you want to see the result localy use the following command to start service the documentation

```bash
# Serving documenation
yarn docs 
```