"use client";

import { useEffect, useRef } from "react";

type Signal = {
  x: number;
  y: number;
  size: number;
  phase: number;
  strength: number;
  accent: boolean;
  block: boolean;
};

export function AgentSignalField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const canvasElement = canvas;
    const ctx = context;

    let frame = 0;
    let width = 0;
    let height = 0;
    let signals: Signal[] = [];
    const pointer = { x: -1000, y: -1000, active: false };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function rebuild() {
      width = canvasElement.clientWidth;
      height = canvasElement.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasElement.width = Math.floor(width * dpr);
      canvasElement.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cell = width < 720 ? 16 : 12;
      const cols = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);
      signals = [];

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * cell + ((row % 2) * cell) / 2;
          const y = row * cell;
          const nx = x / Math.max(width, 1);
          const ny = y / Math.max(height, 1);
          const upper = ny > 0.08 && ny < 0.7;
          const leftBand = Math.abs(nx - (0.1 + Math.sin(ny * 5.2) * 0.04));
          const rightBand = Math.abs(nx - (0.9 + Math.cos(ny * 4.7) * 0.05));
          const verticalCore = Math.abs(nx - (0.52 + Math.sin(ny * 8) * 0.03)) < 0.1 && upper;
          const horizontal = Math.abs(ny - 0.34) < 0.07 && nx > -0.02 && nx < 1.02;
          const diagonal = Math.abs(ny - (0.67 - nx * 0.5)) < 0.046 && nx > 0.02 && nx < 0.98;
          const core = ((nx - 0.5) / 0.55) ** 2 + ((ny - 0.36) / 0.24) ** 2 < 1;
          const spine = upper && (leftBand < 0.052 || rightBand < 0.05 || verticalCore || horizontal || diagonal || core);
          const field = Math.sin(col * 0.84 + row * 0.37) > -0.08 && nx > -0.02 && nx < 1.02 && ny > 0.06 && ny < 0.76;

          if (!spine && !field) continue;

          const seeded = Math.abs(Math.sin(col * 12.9898 + row * 78.233) * 43758.5453) % 1;
          const accent = spine && seeded > 0.9;
          signals.push({
            x,
            y,
            size: accent ? cell * 0.95 : seeded > 0.72 ? cell * 0.5 : cell * 0.24,
            phase: seeded * Math.PI * 2,
            strength: spine ? 1 : 0.48,
            accent,
            block: accent || seeded > 0.82,
          });
        }
      }
    }

    function draw(time: number) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#040406";
      ctx.fillRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(width * 0.38, height * 0.55, 0, width * 0.38, height * 0.55, width * 0.72);
      gradient.addColorStop(0, "rgba(52, 112, 190, 0.24)");
      gradient.addColorStop(0.38, "rgba(10, 16, 24, 0.26)");
      gradient.addColorStop(1, "rgba(4, 4, 6, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (const signal of signals) {
        const dx = signal.x - pointer.x;
        const dy = signal.y - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const cursor = pointer.active ? Math.max(0, 1 - distance / 190) : 0;
        const pulse = reduceMotion ? 0.08 : (Math.sin(time * 0.0017 + signal.phase) + 1) * 0.11;
        const alpha = Math.min(1, signal.strength * 0.48 + pulse + cursor * 0.72);
        const size = signal.size + cursor * 7 + (signal.accent ? 2 : 0);

        ctx.fillStyle = signal.accent
          ? `rgba(70, 154, 255, ${0.32 + alpha * 0.58})`
          : `rgba(226, 232, 240, ${alpha})`;

        if (signal.block) {
          ctx.fillRect(signal.x - size / 2, signal.y - size / 2, size, size);
        } else {
          ctx.fillRect(signal.x - 1, signal.y - 1, 2, 2);
        }
      }

      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1;
      for (let y = 72; y < height; y += 72) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const scanY = reduceMotion ? height * 0.47 : ((time * 0.03) % (height + 260)) - 130;
      const scan = ctx.createLinearGradient(0, scanY - 90, 0, scanY + 90);
      scan.addColorStop(0, "rgba(70, 154, 255, 0)");
      scan.addColorStop(0.5, "rgba(70, 154, 255, 0.12)");
      scan.addColorStop(1, "rgba(70, 154, 255, 0)");
      ctx.fillStyle = scan;
      ctx.fillRect(0, scanY - 90, width, 180);

      if (!reduceMotion) frame = requestAnimationFrame(draw);
    }

    function move(event: PointerEvent) {
      const rect = canvasElement.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;
    }

    function leave() {
      pointer.active = false;
    }

    rebuild();
    draw(0);
    if (!reduceMotion) frame = requestAnimationFrame(draw);

    window.addEventListener("resize", rebuild);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", rebuild);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full opacity-35 sm:opacity-100" aria-hidden="true" />;
}
