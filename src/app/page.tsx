"use client";
import { useState } from "react";
import DrawingCanvas from "@/components/DrawingCanvas";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // ✅ Function to handle drawing submission (For AI processing)
  const handleSubmit = async (imageData: string) => {
    console.log(" Sending image to backend:", imageData);
    setResult("⏳ AI is analyzing your drawing...");
  
    try {
      const response = await fetch("https://ai-draw-backend.onrender.com/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData }),
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.error || "API request failed");
  
      // ✅ Fix: Extract text from AI response properly
      const aiResponse = data.result?.candidates?.[0]?.content?.parts?.[0]?.text || "No meaningful response.";
  
      setResult(aiResponse);
    } catch (error) {
      console.error("❌ Frontend Error:", error);
      setResult("⚠️ Error analyzing drawing.");
    }
  };
  

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} min-h-screen flex flex-col items-center transition-all`}>
      {/* Header */}
      <div className={`w-full flex justify-between items-center p-4 shadow-md ${darkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black"}`}>
        <h1 className="text-2xl font-bold">AI-Powered Drawing Recognition</h1>
        <button onClick={toggleDarkMode} className="p-2 bg-gray-300 dark:bg-gray-700 rounded-full">
          {darkMode ? <SunIcon className="h-6 w-6 text-yellow-400" /> : <MoonIcon className="h-6 w-6 text-gray-800" />}
        </button>
      </div>
      <div className={`w-11/12 max-w-6xl mt-4 p-4 rounded-lg text-center ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"} shadow-md`}>
  <h2 className="text-xl font-semibold mb-2">Instructions for Kids</h2>
  <p className="text-lg">
    Draw anything that comes to your mind! Let your imagination run wild and learn something new about your creation!
  </p>
</div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row w-11/12 max-w-6xl mt-4 gap-4 md:gap-6 items-center md:items-start">
        {/* Left Side: Drawing Board */}
        <div className={`w-full md:w-2/3 p-4 shadow-md rounded-lg transition-all ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}>
          <h2 className="text-xl font-semibold mb-2">Board</h2>
          {/* ✅ Pass the missing onSubmit prop */}
          <DrawingCanvas darkMode={darkMode} onSubmit={handleSubmit} />
        </div>

        {/* Right Side: AI Output */}
        <div className={`w-full md:w-1/3 p-4 md:p-6 shadow-md rounded-lg transition-all text-sm ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}>
  <h2 className="text-xl font-semibold mb-4">Output</h2>
  <div className={`w-full h-80 flex items-center justify-center border rounded-lg px-6 py-4 transition-all ${darkMode ? "bg-gray-900 text-gray-300 border-gray-600" : "bg-gray-50 text-gray-700 border-gray-400"}`}>
    <p className="text-lg">{result || "No result yet..."}</p>
  </div>
</div>

      </div>

{/* Footer */}
<footer className={`w-full text-center p-4 mt-10 ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-700"}`}>
  <p>© {new Date().getFullYear()} AI Drawing Recognition. All Rights Reserved.</p>
  <p>
    Built by <a href="https://github.com/muntasirhossen" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Muntasir Hossen</a>
  </p>
</footer>
    </div>

  );
}
