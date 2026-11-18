import React, { useEffect, useRef } from 'react';

interface ShaderBackgroundProps {
  theme?: 'student' | 'parent' | 'ops' | 'college' | string;
}

export const ShaderBackground: React.FC<ShaderBackgroundProps> = ({ theme = 'student' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let t = 0;

    // Luminous Million-Dollar Tech Palette: Vibrant Orange, Electric Blue, Aqua Cyan, Warm Espresso Coffee
    const palettes: Record<string, Array<{ r: number; g: number; b: number; a: number }>> = {
      student: [
        { r: 255, g: 107, b: 44, a: 0.22 },  // Vibrant CampusKart Orange (#FF6B2C)
        { r: 14, g: 165, b: 233, a: 0.18 },  // Electric Sky Blue (#0EA5E9)
        { r: 6, g: 182, b: 212, a: 0.16 },   // Fluid Aqua Cyan (#06B6D4)
        { r: 139, g: 90, b: 60, a: 0.12 }    // Warm Roasted Coffee (#8B5A3C)
      ],
      parent: [
        { r: 2, g: 132, b: 199, a: 0.20 },   // FinTech Royal Blue (#0284C7)
        { r: 6, g: 182, b: 212, a: 0.20 },   // Aqua Glass (#06B6D4)
        { r: 249, g: 115, b: 22, a: 0.16 },  // Warm Orange Accent (#F97316)
        { r: 111, g: 78, b: 55, a: 0.12 }    // Coffee Roast (#6F4E37)
      ],
      ops: [
        { r: 234, g: 88, b: 12, a: 0.22 },   // Operations Tangerine (#EA580C)
        { r: 111, g: 78, b: 55, a: 0.18 },   // Espresso Coffee (#6F4E37)
        { r: 14, g: 165, b: 233, a: 0.16 },  // Electric Blue (#0EA5E9)
        { r: 245, g: 158, b: 11, a: 0.15 }   // Warm Amber (#F59E0B)
      ],
      college: [
        { r: 3, g: 105, b: 161, a: 0.20 },   // Institutional Deep Blue (#0369A1)
        { r: 249, g: 115, b: 22, a: 0.18 },  // Warm Orange (#F97316)
        { r: 6, g: 182, b: 212, a: 0.16 },   // Aqua (#06B6D4)
        { r: 120, g: 82, b: 56, a: 0.14 }    // Coffee Bronze (#785238)
      ]
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      t += 0.005;
      const w = canvas.width;
      const h = canvas.height;
      // Warm Alabaster / Porcelain White base
      ctx.fillStyle = '#FAF7F2';
      ctx.fillRect(0, 0, w, h);

      const cols = palettes[theme] || palettes.student;
      cols.forEach((c, idx) => {
        const x = w * (0.5 + 0.36 * Math.sin(t * (0.75 + idx * 0.18) + idx * 1.6));
        const y = h * (0.5 + 0.34 * Math.cos(t * (0.65 + idx * 0.14) + idx * 2.1));
        const radius = Math.max(w, h) * (0.46 + 0.08 * Math.sin(t + idx));

        const grad = ctx.createRadialGradient(x, y, 12, x, y, radius);
        grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`);
        grad.addColorStop(0.55, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * 0.35})`);
        grad.addColorStop(1, 'rgba(250, 247, 242, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
};

export default ShaderBackground;
