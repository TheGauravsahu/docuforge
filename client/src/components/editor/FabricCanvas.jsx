import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { useEditorStore } from "../../store/useEditorStore.js";

export default function FabricCanvas() {
  const canvasRef = useRef(null);
  const fabricInstanceRef = useRef(null);

  const {
    document,
    activePageIndex,
    selectedElementId,
    setSelectedElement,
    updateElement,
    zoomLevel,
  } = useEditorStore();
  const activePage = document?.contentJson?.pages?.[activePageIndex];
  const theme = document?.contentJson?.theme || {};

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric Canvas (Standard A4 canvas dimensions: 700x990)
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 700,
      height: 990,
      backgroundColor: theme.backgroundColor || "#FAFAF8",
      selection: true,
    });

    fabricInstanceRef.current = canvas;

    // Handle element selection
    canvas.on("selection:created", (e) => {
      const activeObj = e.selected?.[0];
      if (activeObj && activeObj.elementId) {
        setSelectedElement(activeObj.elementId);
      }
    });

    canvas.on("selection:updated", (e) => {
      const activeObj = e.selected?.[0];
      if (activeObj && activeObj.elementId) {
        setSelectedElement(activeObj.elementId);
      }
    });

    canvas.on("selection:cleared", () => {
      setSelectedElement(null);
    });

    // Handle object position & scale modification
    canvas.on("object:modified", (e) => {
      const activeObj = e.target;
      if (activeObj && activeObj.elementId) {
        updateElement(activePageIndex, activeObj.elementId, {
          y: Math.round(activeObj.top),
          x: Math.round(activeObj.left),
          width: Math.round(activeObj.width * activeObj.scaleX),
          content: activeObj.text || activeObj.content,
        });
      }
    });

    return () => {
      canvas.dispose();
      fabricInstanceRef.current = null;
    };
  }, [activePageIndex]);

  // Load objects when page or theme changes
  useEffect(() => {
    const canvas = fabricInstanceRef.current;
    if (!canvas || !activePage) return;

    canvas.clear();
    canvas.setBackgroundColor(
      theme.backgroundColor || "#FAFAF8",
      canvas.renderAll.bind(canvas)
    );

    const elements = activePage.elements || [];

    elements.forEach((el) => {
      if (el.type === "text") {
        // Use fabric.Textbox for automatic word wrapping within canvas boundaries
        const textObj = new fabric.Textbox(el.content || "Text", {
          left: el.x || 45,
          top: el.y || 50,
          width: el.width || 610,
          fontSize: el.fontSize || 14,
          fontFamily: el.fontFamily || theme.fontFamily || "Georgia",
          fontWeight: el.fontWeight || "normal",
          fill: el.color || theme.primaryColor || "#1A1A1A",
          textAlign: el.align || "left",
          splitByGrapheme: false,
          editable: true,
          elementId: el.id,
          lineHeight: 1.3,
        });

        // Sync inline text editing back to store
        textObj.on("changed", () => {
          updateElement(activePageIndex, el.id, { content: textObj.text });
        });

        canvas.add(textObj);

        // Highlight if selected
        if (el.id === selectedElementId) {
          canvas.setActiveObject(textObj);
        }
      }
    });

    canvas.renderAll();
    if (window.document.fonts) {
      window.document.fonts.ready.then(() => {
        canvas.renderAll();
      });
    }
  }, [activePage, theme, selectedElementId]);

  const borderStyle = theme.borderStyle || 'double';
  const borderStyleClass =
    borderStyle.includes('double')
      ? 'doc-border-double'
      : borderStyle.includes('single')
        ? 'doc-border-single'
        : borderStyle.includes('ornamental')
          ? 'doc-border-ornamental'
          : 'border border-gray-300';

  return (
    <div className="flex flex-col items-center justify-start p-8 min-h-full">
      <div
        className={`relative shadow-2xl transition-transform duration-150 bg-white ${borderStyleClass}`}
        style={{
          width: 700,
          height: 990,
          backgroundColor: theme.backgroundColor || "#FAFAF8",
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center',
        }}
      >
        <canvas ref={canvasRef} />

        {/* Page footer marker */}
        <div className="absolute bottom-4 right-8 text-[11px] text-gray-400 select-none">
          Page {activePageIndex + 1} of{" "}
          {document?.contentJson?.pages?.length || 1}
        </div>
      </div>
    </div>
  );
}
