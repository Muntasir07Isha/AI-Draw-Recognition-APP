"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Sketch = dynamic(() => import("react-p5"), { ssr: false });
const SketchPicker = dynamic(() =>
  import("react-color").then((mod) => mod.SketchPicker),
  { ssr: false }
);

const DrawingCanvas = ({
  onSubmit,
  darkMode,
}: {
  onSubmit: (imageData: string) => void;
  darkMode: boolean;
}) => {
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [shape, setShape] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [p5Instance, setP5Instance] = useState<any>(null);
  const [canvasSize, setCanvasSize] = useState(400);

  useEffect(() => {
    setMounted(true);
    
    // Responsive canvas sizing
    const updateCanvasSize = () => {
      const width = document.getElementById('canvas-container')?.clientWidth || 400;
      setCanvasSize(Math.min(width, 400));
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const setup = (p5: any, canvasParentRef: any) => {
    setP5Instance(p5);
    p5.createCanvas(canvasSize, canvasSize).parent(canvasParentRef);
    p5.background(darkMode ? 30 : 255);
  };

  const draw = (p5: any) => {
    p5.stroke(color);
    p5.strokeWeight(brushSize);
    if (p5.mouseIsPressed && shape === "") {
      p5.line(p5.pmouseX, p5.pmouseY, p5.mouseX, p5.mouseY);
    }
  };

  const mousePressed = (p5: any) => {
    if (shape === "rectangle") {
      p5.fill(color);
      p5.rect(p5.mouseX, p5.mouseY, 50, 50);
    } else if (shape === "circle") {
      p5.fill(color);
      p5.ellipse(p5.mouseX, p5.mouseY, 50, 50);
    }
  };
  
  // Mobile touch support
  const touchStarted = (p5: any) => {
    if (shape === "rectangle") {
      p5.fill(color);
      p5.rect(p5.touches[0].x, p5.touches[0].y, 50, 50);
    } else if (shape === "circle") {
      p5.fill(color);
      p5.ellipse(p5.touches[0].x, p5.touches[0].y, 50, 50);
    }
    return false; // prevent default
  };

  const touchMoved = (p5: any) => {
    if (shape === "") {
      p5.stroke(color);
      p5.strokeWeight(brushSize);
      if (p5.touches && p5.touches.length > 0) {
        p5.line(p5.touches[0].x, p5.touches[0].y, p5.touches[0].px, p5.touches[0].py);
      }
    }
    return false; // prevent default
  };

  const clearCanvas = () => {
    if (p5Instance) {
      p5Instance.background(darkMode ? 30 : 255);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {mounted && (
        <>
          <div className="flex flex-wrap items-center gap-4 border-b pb-2 w-full justify-center">
            <span className="font-semibold">Shapes:</span>
            <button
              onClick={() => setShape("")}
              className={`px-3 py-1 min-h-[44px] border rounded-lg ${
                shape === ""
                  ? "bg-blue-500 text-white"
                  : darkMode
                  ? "bg-gray-600 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              Freehand
            </button>
            <button
              onClick={() => setShape("rectangle")}
              className={`px-3 py-1 min-h-[44px] border rounded-lg ${
                shape === "rectangle"
                  ? "bg-blue-500 text-white"
                  : darkMode
                  ? "bg-gray-600 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              Rectangle
            </button>
            <button
              onClick={() => setShape("circle")}
              className={`px-3 py-1 min-h-[44px] border rounded-lg ${
                shape === "circle"
                  ? "bg-blue-500 text-white"
                  : darkMode
                  ? "bg-gray-600 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              Circle
            </button>
          </div>

          {/* Drawing Canvas */}
          <div id="canvas-container" className="w-full max-w-[400px]">
            <Sketch 
              setup={setup} 
              draw={draw} 
              mousePressed={mousePressed}
              touchStarted={touchStarted}
              touchMoved={touchMoved}
              windowResized={() => {
                const width = document.getElementById('canvas-container')?.clientWidth || 400;
                const size = Math.min(width, 400);
                if (p5Instance) p5Instance.resizeCanvas(size, size);
              }}
            />
          </div>

          {/* Color Picker & Brush Size */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full px-4 gap-4">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`px-4 py-2 rounded-lg hover:bg-opacity-80 transition ${
                  darkMode ? "bg-blue-400 text-white" : "bg-blue-500 text-white"
                }`}
                style={{
                  minHeight: '44px',
                  minWidth: '100px'
                }}
              >
                Pick Color
              </button>
              {showColorPicker && (
                <div className="absolute left-0 mt-2 z-10 shadow-lg">
                  <div 
                    className="fixed inset-0 bg-transparent" 
                    onClick={() => setShowColorPicker(false)}
                  ></div>
                  <div className="relative">
                    <SketchPicker
                      color={color}
                      onChange={(newColor) => setColor(newColor.hex)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/*  Brush Size */}
            <div>
              <span className="font-semibold block text-center mb-1">
                Brush Size
              </span>
              <input
                type="range"
                min="1"
                max="10"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-32"
              />
              <span className="ml-2">{brushSize}px</span>
            </div>
          </div>

          {/* Submit & Reset Buttons */}
          <div className="flex justify-between w-full mt-4">
            <button
              onClick={clearCanvas}
              className={`px-4 py-2 rounded-lg hover:bg-opacity-80 transition ${
                darkMode ? "bg-red-500 text-white" : "bg-red-500 text-white"
              }`}
              style={{ minHeight: '44px', minWidth: '80px' }}
            >
              Reset
            </button>
            <button
              onClick={() => {
                const imageData = p5Instance.canvas.toDataURL();
                onSubmit(imageData);
              }}
              className={`px-4 py-2 rounded-lg hover:bg-opacity-80 transition ${
                darkMode ? "bg-green-500 text-white" : "bg-green-500 text-white"
              }`}
              style={{ minHeight: '44px', minWidth: '80px' }}
            >
              Submit
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DrawingCanvas;