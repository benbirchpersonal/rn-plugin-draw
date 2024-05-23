import { useState, useEffect, useRef } from "react";
import {
  useSyncedStorageState,
  renderWidget,
  usePlugin,
  useRunAsync,
  WidgetLocation
} from "@remnote/plugin-sdk";

const SvgDrawerWidget = () => {
  const STORAGE_KEY = "svg_code";
  const plugin = usePlugin();
  const widgetContext = useRunAsync(() => plugin.widget.getWidgetContext<WidgetLocation.UnderRemEditor>(), []);
  const curRemId = widgetContext?.remId;

  const [svgCode, setSvgCode] = useSyncedStorageState<string>(
    STORAGE_KEY + curRemId,
    ""
  );

  const [inputSvgCode, setInputSvgCode] = useState(svgCode); // Initialize with stored SVG code
  const [editMode, setEditMode] = useState(false);
  const [paths, setPaths] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState("black");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && svgCode && !editMode) {
      drawSVG(svgCode);
    }
  }, [svgCode, editMode]);

  const drawSVG = (svgContent: string) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    const svg = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svg);
    img.onload = () => {
      if (!canvasRef.current) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Clear canvas before drawing
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let drawing = false;

    const startDrawing = (event: MouseEvent) => {
      if (!editMode) return;
      drawing = true;
      ctx.strokeStyle = selectedColor;
      const { x, y } = getCanvasCoordinates(event);
      ctx.beginPath();
      ctx.moveTo(x, y);
      setPaths((prev) => [...prev, `<path d="M ${x} ${y}`]);
    };

    const draw = (event: MouseEvent) => {
      if (!drawing || !editMode) return;
      const { x, y } = getCanvasCoordinates(event);
      ctx.lineTo(x, y);
      ctx.stroke();
      setPaths((prev) => [...prev.slice(0, -1), `${prev[prev.length - 1]} L ${x} ${y}`]);
    };

    const stopDrawing = () => {
      if (!drawing) return;
      drawing = false;
      setPaths((prev) => [...prev.slice(0, -1), `${prev[prev.length - 1]}" stroke="${selectedColor}" fill="transparent" />`]);
      ctx.closePath();
    };

    const getCanvasCoordinates = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    if (editMode) {
      canvas.addEventListener("mousedown", startDrawing);
      canvas.addEventListener("mousemove", draw);
      canvas.addEventListener("mouseup", stopDrawing);
      canvas.addEventListener("mouseout", stopDrawing);
    }

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);
    };
  }, [editMode, selectedColor]);

  const handleSubmit = () => {
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
        ${paths.join(' ')}
      </svg>
    `;
    setSvgCode(svgContent.trim());
    setEditMode(false);
  };

  return (
    <div>
      {editMode ? (
        <div>
          <div>
            <label>Select Color: </label>
            {["black", "red", "green", "blue", "orange", "white"].map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{
                  backgroundColor: color,
                  border: selectedColor === color ? "2px solid black" : "1px solid gray",
                  margin: "5px",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer"
                }}
              />
            ))}
          </div>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            style={{ border: "1px solid black", marginTop: "10px" }}
          />
          <br />
          <button style={{ marginTop: "10px", padding: "10px", fontSize: "16px" }} onClick={handleSubmit}>Submit</button>
        </div>
      ) : (
    
          <canvas
            ref={canvasRef}
            max-width={700}
            height={300}
          />

      )}
      <br />
      <button style={{ padding: "10px", fontSize: "10px", color:"darkgray"}} onClick={() => {
        setPaths([]); // Clear previous paths when entering edit mode
        setEditMode(!editMode);
      }}>
        {editMode ? "Cancel" : "Edit"}
      </button>
    </div>
  );
};

renderWidget(SvgDrawerWidget);