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
      Object.keys(event.touches).forEach(key => {
        const pointer = event.touches[key];
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
    this.pointers = this.getPointers(event);
    this.emit('start', this.pointers);
  }

  onTouchMove(event) {
    if (this.isDown) {
      this.pointers = this.getPointers(event);
      this.emit('move', this.pointers);
    }
  }

  onTouchEnd() {
    this.isDown = false;
    this.emit('end', this.pointers);
  }
}
