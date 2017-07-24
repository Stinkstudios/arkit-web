import Happens from 'happens';

export default class TouchControls {
  constructor(element) {
    Happens(this);

    this.pointers = [];
    this.isDown = false;

    element.addEventListener(
      'touchstart',
      event => this.onTouchStart(event),
      true
    );
    element.addEventListener(
      'touchmove',
      event => this.onTouchMove(event),
      true
    );
    element.addEventListener('touchend', event => this.onTouchEnd(event), true);
  }

  getPointers(event) {
    const pointers = [];

    if (event.touches !== undefined) {
      Object.values(event.touches).forEach(pointer => {
        pointers.push({
          x: pointer.pageX / window.innerWidth,
          y: pointer.pageY / window.innerHeight
        });
      });
    } else {
      pointers.push({
        x: event.pageX / window.innerWidth,
        y: event.pageY / window.innerHeight
      });
    }

    return pointers;
  }

  onTouchStart(event) {
    this.isDown = true;
    const pointers = this.getPointers(event);
    this.emit('start', pointers);
  }

  onTouchMove(event) {
    if (this.isDown) {
      const pointers = this.getPointers(event);
      this.emit('move', pointers);
    }
  }

  onTouchEnd(event) {
    this.isDown = false;
    const pointers = this.getPointers(event);
    this.emit('end', pointers);
  }
}
