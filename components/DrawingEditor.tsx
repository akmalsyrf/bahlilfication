'use client';

import { useRef, useState, useCallback } from 'react';
import DrawingCanvas, { DrawingCanvasRef } from './DrawingCanvas';

interface DrawingEditorProps {
  onImageReady: (imageDataUrl: string) => void;
  onClear?: () => void;
  className?: string;
}

export default function DrawingEditor({
  onImageReady,
  onClear,
  className = '',
}: DrawingEditorProps) {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState('#000000');
  const [hasDrawing, setHasDrawing] = useState(false);

  const handleDrawingChange = useCallback((hasDrawing: boolean) => {
    setHasDrawing(hasDrawing);
  }, []);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    setHasDrawing(false);
    onClear?.();
  }, [onClear]);

  const handleExport = useCallback(() => {
    const imageDataUrl = canvasRef.current?.getImageDataUrl();
    if (imageDataUrl) {
      onImageReady(imageDataUrl);
    }
  }, [onImageReady]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <label htmlFor="brush-size" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Brush Size:
          </label>
          <input
            id="brush-size"
            type="range"
            min="2"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{brushSize}px</span>
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-2">
          <label htmlFor="brush-color" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Color:
          </label>
          <input
            id="brush-color"
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
        </div>

        {/* Clear Button */}
        <button
          onClick={handleClear}
          disabled={!hasDrawing}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Clear
        </button>

        {/* Export/Process Button */}
        <button
          onClick={handleExport}
          disabled={!hasDrawing}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          Process Drawing
        </button>
      </div>

      {/* Canvas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <DrawingCanvas
          ref={canvasRef}
          width={800}
          height={800}
          brushSize={brushSize}
          brushColor={brushColor}
          onDrawingChange={handleDrawingChange}
          className="w-full"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Draw with your mouse or touch to create your image
        </p>
      </div>
    </div>
  );
}

