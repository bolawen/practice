import "./drag.css";
import { useRef, useEffect } from "react";

const Drag = () => {
  const isDraggingRef = useRef(false);
  const downXYRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);

  const computeMousedownXY = (e: any) => {
    const rect = draggableRef.current?.getBoundingClientRect();
    const normalizedE = e.type.startsWith("mouse") ? e : e.touches[0];
    if (rect) {
      const x = normalizedE.pageX - rect.left - window.scrollX;
      const y = normalizedE.pageY - rect.top - window.scrollY;
      return { x, y };
    }
    return { x: 0, y: 0 };
  };

  const computeMousemoveXY = (e: any) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const normalizedE = e.type.startsWith("mouse") ? e : e.touches[0];
    if (containerRect) {
      const x = normalizedE.pageX - downXYRef.current.x - containerRect.left;
      const y = normalizedE.pageY - downXYRef.current.y - containerRect.top;
      return { x, y };
    }
    return { x: 0, y: 0 };
  };

  const limitDrag = (x: number, y: number) => {
    const rect = draggableRef.current?.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (rect && containerRect) {
      x = Math.max(0, Math.min(x, containerRect.width - rect.width));
      y = Math.max(0, Math.min(y, containerRect.height - rect.height));

      if (draggableRef.current) {
        draggableRef.current.style.left = `${x}px`;
        draggableRef.current.style.top = `${y}px`;
      }
    }
  };

  const onMouseDown = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    downXYRef.current = computeMousedownXY(e);
    if (draggableRef.current) {
      draggableRef.current.style.cursor = "grabbing";
    }
  };

  const onMouseMove = (e: any) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = computeMousemoveXY(e);
    requestAnimationFrame(() => limitDrag(x, y));
  };

  const onMouseUp = (e: any) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    isDraggingRef.current = false;
    if (draggableRef.current) {
      draggableRef.current.style.cursor = "grab";
    }
  };

  useEffect(() => {
    const draggable = draggableRef.current;
    if (draggable) {
      draggable.addEventListener("mousedown", onMouseDown);
      draggable.addEventListener("touchstart", onMouseDown);
    }

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchend", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchmove", onMouseMove);

    return () => {
      if (draggable) {
        draggable.removeEventListener("mousedown", onMouseDown);
        draggable.removeEventListener("touchstart", onMouseDown);
      }

      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchend", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchmove", onMouseMove);
    };
  }, []);

  return (
    <div
      className="container"
      ref={containerRef}
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
    >
      <div className="draggable" ref={draggableRef}></div>
    </div>
  );
};

export default Drag;
