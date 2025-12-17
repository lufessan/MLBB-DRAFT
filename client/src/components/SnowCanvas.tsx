import { useEffect, useRef } from "react";

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  swing: number;
  swingSpeed: number;
}

export function SnowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snowflakesRef = useRef<Snowflake[]>([]);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const createSnowflake = (): Snowflake => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      radius: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.8 + 0.2,
      opacity: Math.random() * 0.5 + 0.2,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: Math.random() * 0.02 + 0.005,
    });

    const snowflakeCount = Math.floor((canvas.width * canvas.height) / 15000);
    snowflakesRef.current = Array.from({ length: snowflakeCount }, createSnowflake);

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakesRef.current.forEach((flake) => {
        flake.y += flake.speed;
        flake.swing += flake.swingSpeed;
        flake.x += Math.sin(flake.swing) * 0.3;

        if (flake.y > canvas.height) {
          flake.y = -10;
          flake.x = Math.random() * canvas.width;
        }

        if (flake.x > canvas.width) flake.x = 0;
        if (flake.x < 0) flake.x = canvas.width;

        const gradient = ctx.createRadialGradient(
          flake.x,
          flake.y,
          0,
          flake.x,
          flake.y,
          flake.radius
        );
        gradient.addColorStop(0, `rgba(200, 230, 255, ${flake.opacity})`);
        gradient.addColorStop(1, `rgba(200, 230, 255, 0)`);

        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0d1224 100%)" }}
      data-testid="canvas-snow"
    />
  );
}
