import Tool from "./Tool";

export default class Circle extends Tool {
  constructor(canvas, socket, id) {
    super(canvas, socket, id);
    this.listen();
  }

  listen() {
    this.canvas.onmousemove = this.mouseMoveHandler.bind(this);
    this.canvas.onmousedown = this.mouseDownHandler.bind(this);
    this.canvas.onmouseup = this.mouseUpHandler.bind(this);
  }

  mouseUpHandler(e) {
    this.mouseDown = false;

    try {
      this.socket.send(
        JSON.stringify({
          method: "draw",
          id: this.id,
          figure: {
            type: "circle",
            x: this.startX,
            y: this.startY,
            w: this.width,
            r: this.radius,
            color: this.ctx.fillStyle,
            lineColor: this.ctx.strokeStyle,
            lineWidth: this.ctx.lineWidth,
          },
        })
      );
    } catch (e) {
      console.log(e);
    }
  }

  mouseDownHandler(e) {
    this.mouseDown = true;
    this.ctx.beginPath();
    this.startX = e.pageX - e.target.offsetLeft;
    this.startY = e.pageY - e.target.offsetTop;
    this.saved = this.canvas.toDataURL();
  }

  mouseMoveHandler(e) {
    if (this.mouseDown) {
      let currentX = e.pageX - e.target.offsetLeft;
      let currentY = e.pageY - e.target.offsetTop;
      this.width = currentX - this.startX;
      if (this.width < 0) {
        this.width = this.width * -1;
      }

      this.radius = 0;
      this.draw(this.startX, this.startY, this.width, this.radius);
    }
  }

  draw(x, y, w, r) {
    const img = new Image();
    img.src = this.saved;
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();
      this.ctx.arc(x, y, w, r, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
    };
  }

  static staticDraw(ctx, x, y, w, r, color, lineWidth, lineColor) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, w, r, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }
}
