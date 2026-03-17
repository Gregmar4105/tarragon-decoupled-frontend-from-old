import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    radius: number;
    baseY: number;
    driftSpeed: number;
    swayAmplitude: number;
    swaySpeed: number;
    phase: number;
    opacity: number;
    color: string;
    type: 'dot' | 'circle' | 'tag';
    rotation: number;
    rotationSpeed: number;
}

const COLORS = [
    'rgba(249, 115, 22, ',   // orange-500
    'rgba(251, 146, 60, ',   // orange-400
    'rgba(253, 186, 116, ',  // orange-300
    'rgba(252, 211, 77, ',   // amber-300
    'rgba(245, 158, 11, ',   // amber-500
    'rgba(217, 119, 6, ',    // amber-600
];

const PARTICLE_COUNT = 45;

function createParticle(width: number, height: number): Particle {
    const type = Math.random() < 0.5 ? 'dot' : Math.random() < 0.7 ? 'circle' : 'tag';
    return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: type === 'tag' ? 3 + Math.random() * 4 : 1.5 + Math.random() * 3,
        baseY: Math.random() * height,
        driftSpeed: 0.15 + Math.random() * 0.35,
        swayAmplitude: 15 + Math.random() * 30,
        swaySpeed: 0.0005 + Math.random() * 0.001,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.15 + Math.random() * 0.35,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.008,
    };
}

function drawTag(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = `${p.color}${p.opacity})`;
    ctx.strokeStyle = `${p.color}${p.opacity * 0.8})`;
    ctx.lineWidth = 0.8;

    const w = p.radius * 2.8;
    const h = p.radius * 3.8;

    // Tag body (rounded rect)
    ctx.beginPath();
    const r = p.radius * 0.6;
    ctx.moveTo(-w / 2 + r, -h / 2);
    ctx.lineTo(w / 2 - r, -h / 2);
    ctx.arcTo(w / 2, -h / 2, w / 2, -h / 2 + r, r);
    ctx.lineTo(w / 2, h / 2 - r);
    ctx.arcTo(w / 2, h / 2, w / 2 - r, h / 2, r);
    ctx.lineTo(-w / 2 + r, h / 2);
    ctx.arcTo(-w / 2, h / 2, -w / 2, h / 2 - r, r);
    ctx.lineTo(-w / 2, -h / 2 + r);
    ctx.arcTo(-w / 2, -h / 2, -w / 2 + r, -h / 2, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tag hole
    ctx.beginPath();
    ctx.arc(0, -h / 2 + r + 1.5, p.radius * 0.35, 0, Math.PI * 2);
    ctx.strokeStyle = `${p.color}${p.opacity * 1.2})`;
    ctx.stroke();

    ctx.restore();
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
    if (p.type === 'tag') {
        drawTag(ctx, p);
        return;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

    if (p.type === 'circle') {
        ctx.strokeStyle = `${p.color}${p.opacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
    } else {
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fill();
    }
}

interface ParticleBackgroundProps {
    className?: string;
}

export default function ParticleBackground({ className = '' }: ParticleBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animFrameRef = useRef<number>(0);
    const isVisibleRef = useRef(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize handler
        function resize() {
            const parent = canvas!.parentElement;
            if (!parent) return;
            const dpr = window.devicePixelRatio || 1;
            const rect = parent.getBoundingClientRect();
            canvas!.width = rect.width * dpr;
            canvas!.height = rect.height * dpr;
            canvas!.style.width = `${rect.width}px`;
            canvas!.style.height = `${rect.height}px`;
            ctx!.scale(dpr, dpr);

            // Re-create particles on resize
            particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
                createParticle(rect.width, rect.height)
            );
        }

        resize();

        const ro = new ResizeObserver(resize);
        ro.observe(canvas.parentElement!);

        // Visibility observer — pause animation when off-screen
        const io = new IntersectionObserver(
            ([entry]) => {
                isVisibleRef.current = entry.isIntersecting;
                if (entry.isIntersecting) animate();
            },
            { threshold: 0 }
        );
        io.observe(canvas);

        let lastTime = performance.now();

        function animate() {
            if (!isVisibleRef.current) return;

            const now = performance.now();
            const dt = Math.min((now - lastTime) / 16.667, 3); // normalize to ~60fps, cap to avoid jumps
            lastTime = now;

            const parent = canvas!.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();

            ctx!.clearRect(0, 0, rect.width, rect.height);

            for (const p of particlesRef.current) {
                // Drift upward
                p.y -= p.driftSpeed * dt;

                // Horizontal sway
                p.phase += p.swaySpeed * dt * 16.667;
                p.x += Math.sin(p.phase) * p.swayAmplitude * 0.005 * dt;

                // Rotate tags
                if (p.type === 'tag') {
                    p.rotation += p.rotationSpeed * dt;
                }

                // Wrap around when out of bounds
                if (p.y < -20) {
                    p.y = rect.height + 20;
                    p.x = Math.random() * rect.width;
                }
                if (p.x < -30) p.x = rect.width + 30;
                if (p.x > rect.width + 30) p.x = -30;

                drawParticle(ctx!, p);
            }

            animFrameRef.current = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            cancelAnimationFrame(animFrameRef.current);
            ro.disconnect();
            io.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{ pointerEvents: 'none' }}
            aria-hidden="true"
        />
    );
}
