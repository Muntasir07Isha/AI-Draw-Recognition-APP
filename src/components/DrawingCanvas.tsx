"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SketchPicker } from "react-color";
import p5Types from "p5"; // ✅ Import p5 types

const Sketch = dynamic(() => import("react-p5"), { ssr: false });

interface DrawingCanvasProps {
  onSubmit: (imageData: string) => void;
  darkMode: boolean;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSubmit, darkMode }) => {
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [shape, setShape] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [p5Instance, setP5Instance] = useState<p5Types | null>(null);
  const [canvasSize, setCanvasSize] = useState(400);

  useEffect(() => {
    setMounted(true);
    const updateCanvasSize = () => {
      const width = document.getElementById("canvas-container")?.clientWidth || 400;
      setCanvasSize(Math.min(width, 400));
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    setP5Instance(p5);
    p5.createCanvas(canvasSize, canvasSize).parent(canvasParentRef);
    p5.background(darkMode ? 30 : 255);
  };

  const draw = (p5: p5Types) => {
    p5.stroke(color);
    p5.strokeWeight(brushSize);
    if (p5.mouseIsPressed && shape === "") {
      p5.line(p5.pmouseX, p5.pmouseY, p5.mouseX, p5.mouseY);
    }
  };

  const mousePressed = (p5: p5Types) => {
    p5.fill(color);
    if (shape === "rectangle") {
      p5.rect(p5.mouseX, p5.mouseY, 50, 50);
    } else if (shape === "circle") {
      p5.ellipse(p5.mouseX, p5.mouseY, 50, 50);
    }
  };

  const touchStarted = (p5: p5Types) => {
    if (p5.touches.length > 0) {
      p5.fill(color);
      const touch = p5.touches[0] as { x: number; y: number };
      if (shape === "rectangle") {
        p5.rect(touch.x, touch.y, 50, 50);
      } else if (shape === "circle") {
        p5.ellipse(touch.x, touch.y, 50, 50);
      }
    }
    return false;
  };

  const touchMoved = (p5: p5Types) => {
    if (shape === "" && p5.touches.length > 0) {
      p5.stroke(color);
      p5.strokeWeight(brushSize);
      const touch = p5.touches[0] as { x: number; y: number };
      p5.line(touch.x, touch.y, p5.mouseX, p5.mouseY);
    }
    return false;
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
            <button onClick={() => setShape("")} className={`px-3 py-1 border rounded-lg ${shape === "" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
              Freehand
            </button>
            <button onClick={() => setShape("rectangle")} className={`px-3 py-1 border rounded-lg ${shape === "rectangle" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
              Rectangle
            </button>
            <button onClick={() => setShape("circle")} className={`px-3 py-1 border rounded-lg ${shape === "circle" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
              Circle
            </button>
          </div>

          {/* Drawing Canvas */}
          <div id="canvas-container" className="w-full max-w-[400px]">
            <Sketch setup={setup} draw={draw} mousePressed={mousePressed} touchStarted={touchStarted} touchMoved={touchMoved} />
          </div>

          {/* Color Picker & Brush Size */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full px-4 gap-4">
            <div className="relative">
              <button onClick={() => setShowColorPicker(!showColorPicker)} className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
                Pick Color
              </button>
              {showColorPicker && (
                <div className="absolute left-0 mt-2 z-10 shadow-lg">
                  <div className="fixed inset-0 bg-transparent" onClick={() => setShowColorPicker(false)}></div>
                  <div className="relative">
                    <SketchPicker color={color} onChange={(newColor) => setColor(newColor.hex)} />
                  </div>
                </div>
              )}
            </div>

            {/* Brush Size */}
            <div>
              <span className="font-semibold block text-center mb-1">Brush Size</span>
              <input type="range" min="1" max="10" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-32" />
              <span className="ml-2">{brushSize}px</span>
            </div>
          </div>

          {/* Submit & Reset Buttons */}
          <div className="flex justify-between w-full mt-4">
            <button onClick={clearCanvas} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">
              Reset
            </button>
            <button
  onClick={() => {
    const canvasElement = document.querySelector("canvas") as HTMLCanvasElement;
    if (canvasElement) {
      const imageData = canvasElement.toDataURL(); // ✅ Get image data correctly
      onSubmit(imageData);
    }
  }}
  className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
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
