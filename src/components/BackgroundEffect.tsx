'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface Star {
  x: number;
  y: number;
  z: number;
  originalX: number;
  originalY: number;
}

interface BackgroundEffectProps {
  starCount?: number;
  speedFactor?: number;
  backgroundColor?: string;
  starColor?: string;
}

const BackgroundEffect: React.FC<BackgroundEffectProps> = ({
  starCount = 800, 
  speedFactor = 0.02,
  backgroundColor = '#060021f2',
  starColor = '255,255,255'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const stars: Star[] = Array.from({ length: starCount }, () => {
      const x = Math.random() * dimensions.width;
      const y = Math.random() * dimensions.height;
      return {
        x,
        y,
        z: Math.random() * 1000,
        originalX: x,
        originalY: y
      };
    });

    const clear = () => {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    };

    const moveStars = (distance: number) => {
      stars.forEach(star => {
        star.z -= distance;
        if (star.z <= 1) {
          star.z += 1000;
          star.x = star.originalX;
          star.y = star.originalY;
        }
      });
    };

    let animationFrameId: number;
    let prevTime: number;

    const render = (time: number) => {
      if (prevTime === undefined) {
        prevTime = time;
      }
      const elapsed = time - prevTime;
      prevTime = time;

      moveStars(elapsed * speedFactor);
      clear();

      const mouseXPos = smoothMouseX.get();
      const mouseYPos = smoothMouseY.get();

      stars.forEach(star => {
        const x = star.x / (star.z * 0.001);
        const y = star.y / (star.z * 0.001);

        if (x >= 0 && x < dimensions.width && y >= 0 && y < dimensions.height) {
          const d = star.z / 1000.0;
          const b = 1 - d * d;

          // repel effect
          const dx = x - mouseXPos;
          const dy = y - mouseYPos;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 150; 
          const repelFactor = Math.max(0, 1 - dist / maxDist);
          
          const repelX = dx * repelFactor * 0.2;
          const repelY = dy * repelFactor * 0.2;

          ctx.fillStyle = `rgba(${starColor}, ${b})`;
          ctx.fillRect(x + repelX, y + repelY, 2, 2);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions, starCount, speedFactor, backgroundColor, starColor, smoothMouseX, smoothMouseY]);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    mouseX.set(event.clientX);
    mouseY.set(event.clientY);
  };

  return (
    <motion.canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      onMouseMove={handleMouseMove}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
      }}
    />
  );
};

export default BackgroundEffect;