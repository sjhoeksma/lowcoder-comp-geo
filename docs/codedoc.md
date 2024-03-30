## Classes

<dl>
<dt><a href="#LayerObjectOption">LayerObjectOption</a></dt>
<dd><p>Creates a LayerObjectOption component using MultiCompBuilder.
Allows configuring properties like label, title, source etc for a layer.
Provides controls for selecting layer type, visibility, opacity etc.
Handles rendering the layer options.</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#GEOComp">GEOComp</a></dt>
<dd><p>GEOComp Component configuration.
Defines the styling options exposed in the component properties panel.
By setting the following items within default you can control behavior
     center:[] will disable automatic centering
     debug: true will show eventlog to console</p>
</dd>
<dt><a href="#GEOComp">GEOComp</a></dt>
<dd><p>Exposes methods on GEOComp component to allow calling from parent component.
Includes animate, notify, showPopup, addFeatures, and readFeatures methods.</p>
<p>animate: Perform animation on map.
notify: Display notification message.
showPopup: Show popup at coordinates with message.
addFeatures: Add feature to layer.
readFeatures: Read feature from layer.</p>
</dd>
<dt><a href="#LayerObjectOption">LayerObjectOption</a></dt>
<dd><p>Creates a LayerObjectOption component using MultiCompBuilder.
Allows configuring properties like label, title, source etc for a layer.
Provides controls for selecting layer type, visibility, opacity etc.
Handles rendering the layer options.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#CompStyles">CompStyles</a></dt>
<dd><p>Array of style configuration objects for styling the component.
Each object has a name, label, and style property key.</p>
</dd>
<dt><a href="#geoContext">geoContext</a></dt>
<dd><p>Object that contains the previewMode value which indicates if the app is in preview mode.
previewMode is set based on the existence of the lowcoderdev global.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#featureControl">featureControl()</a></dt>
<dd><p>Generates a feature control component by mapping feature flag keys
to boolean controls.</p>
<p>Accepts a config object with feature flag keys mapped to their default
enabled values. Renders boolean controls for each feature flag, with
getView() returning the current enabled state of each flag.</p>
</dd>
<dt><a href="#SourceControl">SourceControl()</a></dt>
<dd><p>Creates a SourceControl component that allows configuring the source
parameters for a map layer. It is a customized MultiCompBuilder that
generates different source parameters based on the layer type.
The propertyView method renders a UI for configuring the relevant
source parameters.</p>
</dd>
<dt><a href="#layersControl">layersControl()</a></dt>
<dd><p>Creates a LayersControl component using MultiCompBuilder to configure layer options.
Allows selecting layer type, visibility, opacity etc.
Handles rendering the layer options and returns the LayersControl class.</p>
</dd>
</dl>

<a name="LayerObjectOption"></a>

## LayerObjectOption
Creates a LayerObjectOption component using MultiCompBuilder.
Allows configuring properties like label, title, source etc for a layer.
Provides controls for selecting layer type, visibility, opacity etc.
Handles rendering the layer options.

**Kind**: global class  
<a name="GEOComp"></a>

## GEOComp
GEOComp Component configuration.
Defines the styling options exposed in the component properties panel.
By setting the following items within default you can control behavior
     center:[] will disable automatic centering
     debug: true will show eventlog to console

**Kind**: global variable  
<a name="GEOComp"></a>

## GEOComp
Exposes methods on GEOComp component to allow calling from parent component.
Includes animate, notify, showPopup, addFeatures, and readFeatures methods.

animate: Perform animation on map.
notify: Display notification message.
showPopup: Show popup at coordinates with message.
addFeatures: Add feature to layer.
readFeatures: Read feature from layer.

**Kind**: global variable  
<a name="LayerObjectOption"></a>

## LayerObjectOption
Creates a LayerObjectOption component using MultiCompBuilder.
Allows configuring properties like label, title, source etc for a layer.
Provides controls for selecting layer type, visibility, opacity etc.
Handles rendering the layer options.

**Kind**: global variable  
<a name="CompStyles"></a>

## CompStyles
Array of style configuration objects for styling the component.
Each object has a name, label, and style property key.

**Kind**: global constant  
<a name="geoContext"></a>

## geoContext
Object that contains the previewMode value which indicates if the app is in preview mode.
previewMode is set based on the existence of the lowcoderdev global.

**Kind**: global constant  
<a name="featureControl"></a>

## featureControl()
Generates a feature control component by mapping feature flag keys
to boolean controls.

Accepts a config object with feature flag keys mapped to their default
enabled values. Renders boolean controls for each feature flag, with
getView() returning the current enabled state of each flag.

**Kind**: global function  
<a name="SourceControl"></a>

## SourceControl()
Creates a SourceControl component that allows configuring the source
parameters for a map layer. It is a customized MultiCompBuilder that
generates different source parameters based on the layer type.
The propertyView method renders a UI for configuring the relevant
source parameters.

**Kind**: global function  
<a name="layersControl"></a>

## layersControl()
Creates a LayersControl component using MultiCompBuilder to configure layer options.
Allows selecting layer type, visibility, opacity etc.
Handles rendering the layer options and returns the LayersControl class.

**Kind**: global function  
