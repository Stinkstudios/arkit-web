import { Texture } from 'three';

export default class ARVideoTexture {
  constructor(size = 512) {
    this.image = new Image();
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;
    this.ctx = this.canvas.getContext('2d');
    this.texture = new Texture(this.canvas);
  }

  get() {
    return this.texture;
  }

  update(image) {
    this.image.src = `data:image/jpg;base64, ${image}`;

    this.image.onload = () => {
      this.ctx.drawImage(
        this.image,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.texture.needsUpdate = true;
    };
  }
}
