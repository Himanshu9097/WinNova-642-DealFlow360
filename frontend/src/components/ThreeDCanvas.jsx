import { useEffect, useRef } from 'react';

export default function ThreeDCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D Nodes setup
    const numNodes = 45;
    const nodes = [];
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * 600,
        y: (Math.random() - 0.5) * 600,
        z: (Math.random() - 0.5) * 600,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        vz: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1.5
      });
    }

    // 3D Dodecahedron geometry vertices
    const phi = (1 + Math.sqrt(5)) / 2;
    const scale = 140;
    const vertices = [
      [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
      [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
      [0, 1 / phi, phi], [0, 1 / phi, -phi], [0, -1 / phi, phi], [0, -1 / phi, -phi],
      [1 / phi, phi, 0], [1 / phi, -phi, 0], [-1 / phi, phi, 0], [-1 / phi, -phi, 0],
      [phi, 0, 1 / phi], [phi, 0, -1 / phi], [-phi, 0, 1 / phi], [-phi, 0, -1 / phi]
    ].map(v => ({ x: v[0] * scale, y: v[1] * scale, z: v[2] * scale }));

    // Edge connections for 3D dodecahedron
    const edges = [];
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const dx = vertices[i].x - vertices[j].x;
        const dy = vertices[i].y - vertices[j].y;
        const dz = vertices[i].z - vertices[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (Math.abs(dist - scale * 2 / phi) < 10) {
          edges.push([i, j]);
        }
      }
    }

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = (e.clientX - rect.left - width / 2) * 0.001;
      targetMouseY = (e.clientY - rect.top - height / 2) * 0.001;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let angleX = 0;
    let angleY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth lerp mouse tracking
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      angleX += 0.005 + mouseY * 0.05;
      angleY += 0.008 + mouseX * 0.05;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const fov = 400;
      const cx = width / 2;
      const cy = height / 2;

      // Project & Draw Dodecahedron Edges
      const projectedGeo = vertices.map(v => {
        let x1 = v.x * cosY - v.z * sinY;
        let z1 = v.z * cosY + v.x * sinY;
        let y2 = v.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + v.y * sinX;

        const depth = fov / (fov + z2 + 400);
        return {
          x: cx + x1 * depth,
          y: cy + y2 * depth,
          scale: depth,
          z: z2
        };
      });

      ctx.lineWidth = 1.2;
      edges.forEach(([i, j]) => {
        const p1 = projectedGeo[i];
        const p2 = projectedGeo[j];
        const alpha = Math.max(0.1, (p1.scale + p2.scale) / 2 - 0.4);
        ctx.strokeStyle = `rgba(244, 114, 182, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Project & Draw 3D Particle Constellation
      const projectedNodes = nodes.map(n => {
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        if (Math.abs(n.x) > 300) n.vx *= -1;
        if (Math.abs(n.y) > 300) n.vy *= -1;
        if (Math.abs(n.z) > 300) n.vz *= -1;

        let x1 = n.x * cosY - n.z * sinY;
        let z1 = n.z * cosY + n.x * sinY;
        let y2 = n.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + n.y * sinX;

        const depth = fov / (fov + z2 + 400);
        return {
          x: cx + x1 * depth,
          y: cy + y2 * depth,
          scale: depth,
          radius: n.radius * depth
        };
      });

      // Draw particle connections
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const n1 = projectedNodes[i];
          const n2 = projectedNodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.25;
            ctx.strokeStyle = `rgba(214, 83, 109, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      projectedNodes.forEach(n => {
        ctx.fillStyle = 'rgba(251, 113, 133, 0.7)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(1, n.radius), 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="position-absolute inset-0 w-100 h-100 pointer-events-none" 
      style={{ zIndex: 1 }}
    />
  );
}
