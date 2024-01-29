import React, { useEffect, useRef, useState } from "react";
import "../styles/canvas.scss";
import { observer } from "mobx-react-lite";
import canvasState from "../store/canvasState";
import toolState from "../store/toolState";
import Brush from "../tools/Brush";
import Rect from "../tools/Rect";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useParams } from "react-router-dom";
import axios from "axios";
import Eraser from "../tools/Eraser";
import Line from "../tools/Line";
import Circle from "../tools/Circle";

const Canvas = observer(() => {
  const canvasRef = useRef();
  const usernameRef = useRef();

  const [modal, setModal] = useState(true);

  const params = useParams();

  useEffect(() => {
    canvasState.setCanvas(canvasRef.current);
    let ctx = canvasRef.current.getContext("2d");

    axios
      .get(`http://localhost:5000/image?id=${params.id}`)
      .then((response) => {
        const img = new Image();
        img.src = response.data;
        img.onload = () => {
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          ctx.drawImage(
            img,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        };
      });
  }, []);

  useEffect(() => {
    let socket;
    //console.log(canvasState.username);

    if (canvasState.username) {
      socket = new WebSocket(`ws://localhost:5000`);
      canvasState.setSoket(socket);
      canvasState.setSessionId(params.id);
      toolState.setTool(new Brush(canvasRef.current, socket, params.id));

      socket.onopen = () => {
        console.log("Connection established");
        socket.send(
          JSON.stringify({
            id: params.id,
            username: canvasState.username,
            method: "connection",
          })
        );
      };

      socket.onmessage = function (event) {
        let msg = JSON.parse(event.data);
        //console.log(msg);

        switch (msg.method) {
          case "connection":
            console.log(`user ${msg.username} connection`);
            // console.log(canvasRef.current.getContext("2d"));
            break;

          case "draw":
            drawHandler(msg);
            break;
        }
      };
    }
  }, [canvasState.username]);

  const drawHandler = (msg) => {
    const figure = msg.figure;

    const ctx = canvasRef.current.getContext("2d");

    console.log(figure);
    switch (figure.type) {
      case "brush":
        Brush.draw(ctx, figure.x, figure.y, figure.lineColor, figure.lineWidth);
        break;
      case "eraser":
        Eraser.draw(ctx, figure.x, figure.y, figure.widthL);
        break;
      case "line":
        Line.staticDraw(
          ctx,
          figure.x,
          figure.y,
          figure.startX,
          figure.startY,
          figure.color,
          figure.lineWidth
        );
        break;
      case "rect":
        Rect.staticDraw(
          ctx,
          figure.x,
          figure.y,
          figure.width,
          figure.height,
          figure.color,
          figure.lineWidth,
          figure.lineColor
        );
      case "circle":
        Circle.staticDraw(
          ctx,
          figure.x,
          figure.y,
          figure.w,
          figure.r,
          figure.color,
          figure.lineWidth,
          figure.lineColor
        );
        break;
      case "finish":
        ctx.beginPath();
        break;
    }
  };

  const imageUploadUrl = "http://localhost:5000/image";

  const mouseDownHandler = async () => {
    canvasState.pushToUndo(canvasRef.current.toDataURL());
  };

  const mouseUpHandler = async () => {
    try {
      // Push the current canvas state to undo
      canvasState.pushToUndo(canvasRef.current.toDataURL());

      // Send the image to the server
      const response = await axios.post(`${imageUploadUrl}?id=${params.id}`, {
        img: canvasRef.current.toDataURL(),
      });

      console.log(response.data);
    } catch (error) {
      console.error("Error uploading image:", error.message);
      // Handle the error appropriately
    }
  };

  const connectHandler = () => {
    canvasState.setUsername(usernameRef.current.value);
    setModal(false);
  };

  return (
    <div className="canvas">
      <Modal show={modal} onHide={() => {}}>
        <Modal.Header>
          <Modal.Title>enter a name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type="text" ref={usernameRef} />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              connectHandler();
            }}
          >
            enter
          </Button>
        </Modal.Footer>
      </Modal>
      <canvas
        onMouseDown={() => mouseDownHandler()}
        onMouseUp={() => mouseUpHandler()}
        ref={canvasRef}
        width={600}
        height={600}
      ></canvas>
    </div>
  );
});

export default Canvas;
