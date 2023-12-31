import React, { useRef, useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [drawing, setDrawing] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [penColor, setPenColor] = useState('#000000'); // black

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.lineWidth = 5;
    contextRef.current = context;
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = penColor;
    }
  }, [penColor]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    if (drawing.length > 0) {
      setUndoStack([...undoStack,  drawing]);
      setDrawing([]);
      setRedoStack([]);
    }
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }

    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    setDrawing((prevDrawing) => [...prevDrawing, { offsetX, offsetY }]);
  };


  const undo = () => {
    if (undoStack.length > 0) {
      const lastDrawing = undoStack.pop();
      setRedoStack([...redoStack, lastDrawing]);

      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      undoStack.forEach((drawingCommands) => {
        drawingCommands.forEach((point, index) => {
          if (index === 0) {
            contextRef.current.beginPath();
            contextRef.current.moveTo(point.offsetX, point.offsetY);
          } else {
            contextRef.current.lineTo(point.offsetX, point.offsetY);
            contextRef.current.stroke();
          }
        });

        contextRef.current.closePath();
      });
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextDrawing = redoStack.pop();
      setUndoStack([...undoStack, nextDrawing]);

      nextDrawing.forEach((point, index) => {
        if (index === 0) {
          contextRef.current.beginPath();
          contextRef.current.moveTo(point.offsetX, point.offsetY);
        } else {
          contextRef.current.lineTo(point.offsetX, point.offsetY);
          contextRef.current.stroke();
        }
      });

      contextRef.current.closePath();
    }
  };

  const clear = () => {
    contextRef.current.clearRect(0,0, canvasRef.current.width, canvasRef.current.height);
    setUndoStack([]);
    setDrawing([]);
    setRedoStack([]);
  }

  const setPenColorAndMode = (color) => {
    setPenColor(color);
  };

  return (
    <div>
      <div>
        <ReactModal className="" isOpen={isOpen} contentLabel="Example Modal">
          <div className="flex flex-row justify-between">
            <h1>Hello! This is my simple react drawing application. Have fun!</h1>
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </ReactModal>
      </div>
      
      <div>
        <button className="text-2xl bg-slate-200 m-2 p-2 transition-all hover:bg-slate-400 hover:scale-110" onClick={undo}>Undo</button>
        <button className="text-2xl bg-slate-200 m-2 p-2 transition-all hover:bg-slate-400 hover:scale-110" onClick={redo}>Redo</button>
        <button className="text-2xl bg-slate-200 m-2 p-2 transition-all hover:bg-slate-400 hover:scale-110" onClick={clear}>Clear</button>
        <div className="flex">
          <button
            className={`text-2xl m-2 p-2 transition-all bg-red-400 hover:bg-red-600 hover:scale-110`}
            onClick={() => setPenColorAndMode('#FF0000')}
          >
            Red
          </button>
          <button
            className={`text-2xl m-2 p-2 transition-all bg-black hover:bg-gray-600 hover:scale-110`}
            onClick={() => setPenColorAndMode('#000000')}
          >
            Black
          </button>
          <button
            className={`text-2xl m-2 p-2 transition-all bg-blue-400 hover:bg-blue-600 hover:scale-110`}
            onClick={() => setPenColorAndMode('#0000FF')}
          >
            Blue
          </button>
        </div>
      </div>
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        ref={canvasRef}
      />
    </div>
  );
}

export default App;
