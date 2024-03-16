import { Control } from 'ol/control';

export default class RotateNorthControl extends Control {
    constructor(options = {}) {
      const button = document.createElement('button');
      button.innerHTML = 'N';
  
      const element = document.createElement('div');
      element.className = 'rotate-north ol-unselectable ol-control';
      element.appendChild(button);
  
      super({
        element: element,
        target: options.target,
      });
  
      button.addEventListener('click', this.handleRotateNorth.bind(this), false);
    }
  
    handleRotateNorth() {
      this.getMap().getView().setRotation(0);
    }
  }