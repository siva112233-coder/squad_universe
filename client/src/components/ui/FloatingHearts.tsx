import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  isHeart: boolean;
}

export function FloatingHearts() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#e8b4be', '#c9748a', '#f5c9b0', '#f9e4e9', '#d4a853', '#a0354f'];
    const particles: Particle[] = [];

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 20,
      size: Math.random() * 14 + 6,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: -(Math.random() * 1.5 + 0.5),
      opacity: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      isHeart: Math.random() > 0.4,
    });

    // Initial population
    for (let i = 0; i < 15; i++) {
      const p = createParticle();
      p.y = Math.random() * canvas.height;
      particles.push(p);
    }

    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.lineTo(0, -size);
        ctx.lineTo(size * 0.25, -size * 0.25);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (particles.length < 20 && Math.random() < 0.03) {
        particles.push(createParticle());
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX + Math.sin(Date.now() * 0.001 + i) * 0.3;
        p.y += p.speedY;
        p.opacity -= 0.001;

        if (p.y < -30 || p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.isHeart) {
          drawStar(ctx, p.x, p.y, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
}
