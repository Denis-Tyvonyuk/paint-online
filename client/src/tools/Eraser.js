import Tool from "./Tool";

export default class Eraser extends Tool {
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

    this.socket.send(
      JSON.stringify({
        method: "draw",
        id: this.id,
        figure: {
          type: "finish",
          x: e.pageX - e.target.offsetLeft,
          y: e.pageY - e.target.offsetTop,
          widthL: this.ctx.lineWidth,
        },
      })
    );
  }

  mouseDownHandler(e) {
    this.mouseDown = true;
    this.ctx.beginPath();
    this.ctx.moveTo(
      e.pageX - e.target.offsetLeft,
      e.pageY - e.target.offsetTop
    );
  }

  mouseMoveHandler(e) {
    if (this.mouseDown) {
      this.socket.send(
        JSON.stringify({
          method: "draw",
          id: this.id,
          figure: {
            type: "eraser",
            x: e.pageX - e.target.offsetLeft,
            y: e.pageY - e.target.offsetTop,
            widthL: this.ctx.lineWidth,
          },
        })
      );
    }
  }

  static draw(ctx, x, y, widthL) {
    const eraserSize = widthL; // Adjust the size of the eraser as needed
    ctx.clearRect(x, y, eraserSize, eraserSize);
    ctx.stroke();
  }
}
