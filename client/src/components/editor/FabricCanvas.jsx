import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { useEditorStore } from "../../store/useEditorStore.js";

// In-memory HTML Image element cache to prevent image blinking & network re-fetching
const imageCache = new Map();

export default function FabricCanvas() {
  const canvasRef = useRef(null);
  const fabricInstanceRef = useRef(null);
  const renderFrameRef = useRef(null);

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

  // High-performance 60fps batched renderAll helper
  const safeRender = () => {
    if (renderFrameRef.current) return;
    renderFrameRef.current = requestAnimationFrame(() => {
      renderFrameRef.current = null;
      const cnv = fabricInstanceRef.current;
      if (cnv && !cnv.isDisposed && cnv.lowerCanvasEl && cnv.getContext()) {
        try {
          cnv.renderAll();
        } catch (err) {}
      }
    });
  };

  // 1. Initialize Fabric Canvas once per activePageIndex
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 700,
      height: 990,
      backgroundColor: theme.backgroundColor || "#FAFAF8",
      selection: true,
      renderOnAddRemove: false, // Manual batched rendering for maximum performance
    });

    fabricInstanceRef.current = canvas;

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
      if (renderFrameRef.current) {
        cancelAnimationFrame(renderFrameRef.current);
      }
      canvas.dispose();
      fabricInstanceRef.current = null;
    };
  }, [activePageIndex]);

  // 2. Synchronize elements to canvas in-place when activePage or theme changes
  useEffect(() => {
    const canvas = fabricInstanceRef.current;
    if (!canvas || !activePage || canvas.isDisposed) return;

    canvas.setBackgroundColor(theme.backgroundColor || "#FAFAF8", safeRender);

    const elements = activePage.elements || [];
    const currentObjects = canvas.getObjects();
    const existingObjMap = new Map();

    currentObjects.forEach((obj) => {
      if (obj.elementId) {
        existingObjMap.set(obj.elementId, obj);
      }
    });

    const activeElementIds = new Set(elements.map((e) => e.id));

    // Remove deleted objects
    currentObjects.forEach((obj) => {
      if (obj.elementId && !activeElementIds.has(obj.elementId)) {
        canvas.remove(obj);
      }
    });

    // Add or update elements in-place
    elements.forEach((el) => {
      const existingObj = existingObjMap.get(el.id);

      if (el.type === "text") {
        const fontFam = el.fontFamily || theme.fontFamily || "Georgia";

        if (existingObj && existingObj.type === "textbox") {
          // If user is currently typing directly inside this canvas textbox, preserve cursor & typing focus!
          const isCurrentlyEditing = existingObj.isEditing;
          existingObj.set({
            ...(isCurrentlyEditing ? {} : { text: el.content || "Text" }),
            left: el.x || 45,
            top: el.y || 50,
            width: el.width || 610,
            fontSize: el.fontSize || 14,
            fontFamily: fontFam,
            fontWeight: el.fontWeight || "normal",
            fill: el.color || theme.primaryColor || "#1A1A1A",
            textAlign: el.align || "left",
          });
          existingObj.initDimensions();
          existingObj.dirty = true;
        } else {
          // Create new text object
          const textObj = new fabric.Textbox(el.content || "Text", {
            left: el.x || 45,
            top: el.y || 50,
            width: el.width || 610,
            fontSize: el.fontSize || 14,
            fontFamily: fontFam,
            fontWeight: el.fontWeight || "normal",
            fill: el.color || theme.primaryColor || "#1A1A1A",
            textAlign: el.align || "left",
            splitByGrapheme: false,
            editable: true,
            elementId: el.id,
            lineHeight: 1.3,
          });

          textObj.on("changed", () => {
            updateElement(activePageIndex, el.id, { content: textObj.text });
          });

          canvas.add(textObj);
        }

        // Preload Google fonts
        if (window.document.fonts) {
          window.document.fonts
            .load(`14px "${fontFam}"`)
            .then(() => {
              const cnv = fabricInstanceRef.current;
              if (!cnv || cnv.isDisposed || !cnv.getContext()) return;
              const target = cnv.getObjects().find((o) => o.elementId === el.id);
              if (target) {
                target.initDimensions();
                target.dirty = true;
                safeRender();
              }
            })
            .catch(() => {});
        }
      } else if (el.type === "image" && el.url) {
        const targetW = el.width || 320;
        const targetH = el.height || 220;

        if (existingObj && existingObj.type === "image") {
          // Update existing image object position/scale in-place without reloading
          existingObj.set({
            left: el.x || 50,
            top: el.y || 100,
            scaleX: targetW / (existingObj.width || 1),
            scaleY: targetH / (existingObj.height || 1),
          });
          existingObj.dirty = true;
        } else {
          // Render image using in-memory HTMLImageElement cache to eliminate network load delays & blinking
          const cachedImg = imageCache.get(el.url);
          if (cachedImg) {
            const imgObj = new fabric.Image(cachedImg, {
              left: el.x || 50,
              top: el.y || 100,
              scaleX: targetW / (cachedImg.width || 1),
              scaleY: targetH / (cachedImg.height || 1),
              elementId: el.id,
            });

            imgObj.on("modified", () => {
              updateElement(activePageIndex, el.id, {
                x: Math.round(imgObj.left),
                y: Math.round(imgObj.top),
                width: Math.round(imgObj.width * imgObj.scaleX),
                height: Math.round(imgObj.height * imgObj.scaleY),
              });
            });

            canvas.add(imgObj);
            safeRender();
          } else {
            const imgEl = new Image();
            imgEl.crossOrigin = "anonymous";
            imgEl.onload = () => {
              imageCache.set(el.url, imgEl);
              const cnv = fabricInstanceRef.current;
              if (!cnv || cnv.isDisposed || !cnv.getContext()) return;

              if (cnv.getObjects().some((o) => o.elementId === el.id)) return;

              const imgObj = new fabric.Image(imgEl, {
                left: el.x || 50,
                top: el.y || 100,
                scaleX: targetW / (imgEl.width || 1),
                scaleY: targetH / (imgEl.height || 1),
                elementId: el.id,
              });

              imgObj.on("modified", () => {
                updateElement(activePageIndex, el.id, {
                  x: Math.round(imgObj.left),
                  y: Math.round(imgObj.top),
                  width: Math.round(imgObj.width * imgObj.scaleX),
                  height: Math.round(imgObj.height * imgObj.scaleY),
                });
              });

              cnv.add(imgObj);
              safeRender();
            };
            imgEl.src = el.url;
          }
        }
      }
    });

    safeRender();
  }, [activePage, theme]);

  // 3. Highlight selected element without re-clearing canvas or re-fetching images
  useEffect(() => {
    const canvas = fabricInstanceRef.current;
    if (!canvas || canvas.isDisposed) return;

    if (!selectedElementId) {
      canvas.discardActiveObject();
      safeRender();
      return;
    }

    const targetObj = canvas
      .getObjects()
      .find((o) => o.elementId === selectedElementId);
    if (targetObj && canvas.getActiveObject() !== targetObj) {
      canvas.setActiveObject(targetObj);
      safeRender();
    }
  }, [selectedElementId]);

  const borderStyle = theme.borderStyle || "double";
  const pageBorderColor = theme.borderColor || theme.primaryColor || "#1E5B3F";

  const getBorderStyleObject = () => {
    if (borderStyle.includes("none")) {
      return { border: "none" };
    }
    const width = borderStyle.includes("single") ? "2px" : "4px";
    const style = borderStyle.includes("single") ? "solid" : "double";
    const outline = borderStyle.includes("ornamental") ? `1px solid ${pageBorderColor}` : "none";
    const outlineOffset = borderStyle.includes("ornamental") ? "4px" : "0px";

    return {
      borderWidth: width,
      borderStyle: style,
      borderColor: pageBorderColor,
      outline,
      outlineOffset,
    };
  };

  return (
    <div className="flex flex-col items-center justify-start p-8 min-h-full">
      <div
        className="relative shadow-2xl transition-transform duration-150 bg-white"
        style={{
          width: 700,
          height: 990,
          backgroundColor: theme.backgroundColor || "#FAFAF8",
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: "top center",
          ...getBorderStyleObject(),
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
