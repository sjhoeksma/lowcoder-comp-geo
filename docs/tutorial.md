# Creating the lowcoder-comp-geo demo

Here we explain how we have created the demo app you can
<a href='lowcoder-example/lowcoder-comp-geo.json' download="lowcoder-comp-geo.json"> download here</a>

We start with the `base config` when you drop the plugin on an empty application 
![Base Config](images/baseconfig.png)

## Step 1 - Configure component
<img align="right" src="images/tutorial-step1.png" >

Now we will remove all layers except the `Open Street Map - XYZ` by clicking on `...` on each layer and select `Delete`

By default this layer is `invisible`. By clicking on the layer name, the edit window will open. Toggle the visible flag to true to show the layer.

Now scroll down to behavior section of the properties and toggle the following items on: `modify`,`save` and turn the following items off: `horizontal`, `vertical` split screen.

<br clear="right"/>

## Step 2 - Connect onSave event
<img align="right" src="images/tutorial-step2.png" >

Add an new interaction by clicking `+Add` on the right side of Event Handlers. Select the `onSave` event and for Action `Run Javascript`. Copy the javascript below into the script field.

```js
localStorage.setItem(geo1.getFeatures('draw'))
```
<br clear="right"/>

## Step 3 - Connect onPage load event
<img src="images/tutorial-step3.png" >

On the bottom of your screen within the `Data Queries` click on `+New` and select `Run Javascript Code`, change the trigger when to `When the Application (Page) loads` and copy the code below into the code box.

```js
return geo1.setFeatures('draw',localStorage.getItem('draw'),true)
```

## Step 4 - Start drawing

<img src="images/tutorial-step4.png" >

Toggle one of the draw buttons and start drawing features on the screen. To stop drawing you need to toggle the button again.

When you would refresh the browser you will see that all features are loaded from the local storage.