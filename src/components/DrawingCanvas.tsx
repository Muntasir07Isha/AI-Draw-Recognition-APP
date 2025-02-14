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

  useEffect(() => {
    setMounted(true);
  }, []);

  const setup = (p5: any, canvasParentRef: any) => {
    setP5Instance(p5);
    p5.createCanvas(400, 400).parent(canvasParentRef);
    p5.background(darkMode ? 30 : 255); // 🔥 Dynamic Background (White in Light Mode, Dark in Dark Mode)
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

  const clearCanvas = () => {
    if (p5Instance) {
      p5Instance.background(darkMode ? 30 : 255); // Clear the canvas
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {mounted && (
        <>
          <div className="flex items-center gap-4 border-b pb-2 w-full justify-center">
            <span className="font-semibold">Shapes:</span>
            <button
              onClick={() => setShape("")}
              className={`px-3 py-1 border rounded-lg ${
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
              className={`px-3 py-1 border rounded-lg ${
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
              className={`px-3 py-1 border rounded-lg ${
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
          <Sketch setup={setup} draw={draw} mousePressed={mousePressed} />

          {/* Color Picker & Brush Size */}
          <div className="flex items-center justify-between w-full px-4">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`px-4 py-2 rounded-lg hover:bg-opacity-80 transition ${
                  darkMode ? "bg-blue-400 text-white" : "bg-blue-500 text-white"
                }`}
              >
                Pick Color
              </button>
              {showColorPicker && (
                <div className="absolute left-0 mt-2 z-10 shadow-lg">
                  <SketchPicker
                    color={color}
                    onChange={(newColor) => setColor(newColor.hex)}
                  />
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
            >
              Reset
            </button>
            <button
  onClick={() => {
    const imageData = p5Instance.canvas.toDataURL(); // ✅ Get the drawn image as Base64
    onSubmit(imageData); // ✅ Send to backend
  }}
  className={`px-4 py-2 rounded-lg hover:bg-opacity-80 transition ${
    darkMode ? "bg-green-500 text-white" : "bg-green-500 text-white"
  }`}
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
