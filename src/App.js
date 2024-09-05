import './App.css'; // External CSS for styling

import React, { useEffect, useRef, useState } from 'react';

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    setSocket(ws);

    ws.onmessage = (message) => {
      const actions = JSON.parse(message.data);
      actions.forEach((action) => {
        handleDrawAction(action);
      });
    };

    return () => ws.close();
  }, []);

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(
      event.clientX - canvas.offsetLeft,
      event.clientY - canvas.offsetTop
    );
    setDrawing(true);
  };

  const draw = (event) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(
      event.clientX - canvas.offsetLeft,
      event.clientY - canvas.offsetTop
    );
    ctx.stroke();

    if (socket) {
      const drawAction = {
        type: 'draw',
        coordinates: {
          x: event.clientX - canvas.offsetLeft,
          y: event.clientY - canvas.offsetTop,
        },
      };
      socket.send(JSON.stringify(drawAction));
    }
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.closePath();
    setDrawing(false);
  };

  const handleDrawAction = (action) => {
    if (action.type === 'draw') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineTo(action.coordinates.x, action.coordinates.y);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (socket) {
      const clearAction = { type: 'clear' };
      socket.send(JSON.stringify(clearAction));
    }
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="whiteboard-container">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        width={800}
        height={600}
        className="whiteboard-canvas"
      />
      <div className="button-container">
        <button className="action-button" onClick={clearCanvas}>
          Clear
        </button>
        <button className="action-button" onClick={saveImage}>
          Save
        </button>
      </div>
    </div>
  );
};

export default Whiteboard;
