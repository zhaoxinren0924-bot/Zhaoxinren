
import React, { useRef, useEffect, useState } from 'react';
import { PalBotState, PersonalityTraits } from '../types';

interface AnimatedCatProps {
  color: string;
  colorId?: string;
  state: PalBotState;
  scale?: number;
  personality: PersonalityTraits;
  actionOverride?: 'sit' | 'sleep' | 'jump' | 'stand' | 'crouch' | 'walk';
  moodOverride?: 'happy' | 'sleep' | 'neutral';
  rotation?: number;
  walkCycle?: number; // 0 to 1
  facingLeft?: boolean;
}

const AnimatedCat: React.FC<AnimatedCatProps> = ({ 
  color, 
  colorId, 
  state, 
  scale = 1, 
  personality,
  actionOverride,
  moodOverride,
  rotation = 0,
  walkCycle = 0,
  facingLeft = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [earWiggle, setEarWiggle] = useState(0);

  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    const triggerBlink = () => {
      const nextBlinkIn = Math.random() * 4000 + 2000;
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          triggerBlink();
        }, 150);
      }, nextBlinkIn);
    };
    triggerBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  useEffect(() => {
    let wiggleTimeout: ReturnType<typeof setTimeout>;
    const triggerWiggle = () => {
      const nextWiggleIn = Math.random() * 3000 + 1000;
      wiggleTimeout = setTimeout(() => {
        setEarWiggle(0.12);
        setTimeout(() => setEarWiggle(-0.06), 120);
        setTimeout(() => setEarWiggle(0.09), 240);
        setTimeout(() => {
          setEarWiggle(0);
          triggerWiggle();
        }, 350);
      }, nextWiggleIn);
    };
    triggerWiggle();
    return () => clearTimeout(wiggleTimeout);
  }, []);

  const getDisplayAction = () => {
    if (actionOverride) return actionOverride;
    switch (state) {
      case PalBotState.INTERACTION: return 'stand';
      case PalBotState.IDLE_SELF: return 'sit';
      default: return 'sit';
    }
  };

  const getDisplayMood = () => {
    if (moodOverride) return moodOverride;
    return state === PalBotState.INTERACTION ? 'happy' : 'neutral';
  };

  const drawCat = (ctx: CanvasRenderingContext2D, config: any) => {
    const { color, action, scale, rotation, mood, isBlinkingNow, earWiggleVal, walkCycle, facingLeft } = config;
    const eyeColor = '#7FBF7F';
    const centerX = 100;
    const centerY = 140;

    ctx.save();
    ctx.translate(centerX, centerY);
    if (facingLeft) ctx.scale(-1, 1);
    
    const bodyTilt = action === 'walk' ? Math.cos(walkCycle * Math.PI * 2) * 0.03 : 0;
    ctx.rotate(rotation + bodyTilt);

    if (action === 'sit') {
      ctx.scale(1, 0.88);
    } else if (action === 'sleep') {
      ctx.scale(1.3, 0.7);
      ctx.rotate(-Math.PI / 12);
    } else if (action === 'crouch') {
      ctx.scale(1.2, 0.6);
    } else if (action === 'walk') {
      const bob = Math.abs(Math.sin(walkCycle * Math.PI * 2)) * -4;
      ctx.translate(0, bob);
    }
    
    ctx.scale(scale, scale);

    // --- 高级多节段物理尾巴 (The New Elegant Tail Engine) ---
    if (action !== 'sleep') {
      ctx.save();
      const tailBaseX = 26;
      const tailBaseY = 18;
      
      const segments = 12; 
      const segmentLength = 6.5;
      const tailWidth = 7;
      
      // 尾巴动力学参数 - 调低速度以实现“慢摇”
      const time = Date.now() / 1000;
      const speedScale = action === 'walk' ? 4.5 : 1.8; // 从 12/3.5 大幅降低
      const amplitude = action === 'walk' ? 0.18 : 0.10; // 从 0.25/0.12 降低，增加从容感
      
      ctx.translate(tailBaseX, tailBaseY);
      ctx.fillStyle = color;
      
      const leftPoints: {x: number, y: number}[] = [];
      const rightPoints: {x: number, y: number}[] = [];
      
      let currentAngle = action === 'walk' ? -Math.PI / 4 : -Math.PI / 2.2;
      let curX = 0;
      let curY = 0;

      for (let i = 0; i <= segments; i++) {
        // 波形传递
        const phaseShift = i * 0.45;
        const wave = Math.sin(time * speedScale - phaseShift) * amplitude;
        
        currentAngle += wave;
        
        const nextX = curX + Math.cos(currentAngle) * segmentLength;
        const nextY = curY + Math.sin(currentAngle) * segmentLength;
        
        const normalAngle = currentAngle + Math.PI / 2;
        const width = tailWidth * (1 - (i / segments) * 0.7);
        
        leftPoints.push({
          x: curX + Math.cos(normalAngle) * width,
          y: curY + Math.sin(normalAngle) * width
        });
        rightPoints.push({
          x: curX - Math.cos(normalAngle) * width,
          y: curY - Math.sin(normalAngle) * width
        });

        curX = nextX;
        curY = nextY;
      }

      ctx.beginPath();
      ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
      for (let i = 1; i < leftPoints.length; i++) {
        ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
      }
      ctx.arc(curX, curY, tailWidth * 0.3, currentAngle - Math.PI/2, currentAngle + Math.PI/2);
      for (let i = rightPoints.length - 1; i >= 0; i--) {
        ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
      }
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }

    // --- 身体核心 ---
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 45, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- 头部 ---
    ctx.beginPath();
    ctx.arc(0, -50, 35, 0, Math.PI * 2);
    ctx.fill();

    // --- 耳朵 ---
    const drawEar = (isLeft: boolean) => {
      ctx.save();
      const pivotX = isLeft ? -21 : 21;
      const pivotY = -75;
      ctx.translate(pivotX, pivotY);
      ctx.rotate(isLeft ? -earWiggleVal : earWiggleVal);
      ctx.translate(-pivotX, -pivotY);
      ctx.fillStyle = color;
      ctx.beginPath();
      if (isLeft) {
        ctx.moveTo(-10, -82);
        ctx.quadraticCurveTo(-18, -100, -28, -94);
        ctx.quadraticCurveTo(-36, -90, -32, -65);
      } else {
        ctx.moveTo(10, -82);
        ctx.quadraticCurveTo(18, -100, 28, -94);
        ctx.quadraticCurveTo(36, -90, 32, -65);
      }
      ctx.fill();
      ctx.fillStyle = '#FFB6C1';
      ctx.beginPath();
      if (isLeft) {
        ctx.moveTo(-14, -84);
        ctx.quadraticCurveTo(-19, -95, -25, -91);
        ctx.quadraticCurveTo(-31, -88, -28, -72);
      } else {
        ctx.moveTo(14, -84);
        ctx.quadraticCurveTo(19, -95, 25, -91);
        ctx.quadraticCurveTo(31, -88, 28, -72);
      }
      ctx.fill();
      ctx.restore();
    };
    drawEar(true);
    drawEar(false);

    // --- 眼睛/感知器 ---
    const isSleepMood = mood === 'sleep' || action === 'sleep';
    const isActuallyBlinking = isBlinkingNow && !isSleepMood;
    ctx.fillStyle = eyeColor;
    const eyeY = (isSleepMood || isActuallyBlinking) ? -48 : -50;
    
    if (isActuallyBlinking || isSleepMood) {
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = eyeColor;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-18, eyeY); ctx.lineTo(-6, eyeY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, eyeY); ctx.lineTo(18, eyeY); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(-12, eyeY, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(12, eyeY, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.arc(-12, -50, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(12, -50, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(-11, -51, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(13, -51, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath(); ctx.arc(0, -43, 3, 0, Math.PI * 2); ctx.fill();

    const drawElegantLeg = (offsetX: number, offsetY: number, height: number, cycle: number, isBack: boolean) => {
      ctx.save();
      ctx.translate(offsetX, offsetY);
      const forwardPhase = (cycle % 1);
      const isLifting = forwardPhase > 0.5;
      const swingAngle = Math.sin(cycle * Math.PI * 2) * 0.35;
      const liftHeight = isLifting ? Math.sin((forwardPhase - 0.5) * Math.PI * 2) * 8 : 0;
      ctx.rotate(swingAngle);
      if (isBack) ctx.globalAlpha = 0.55;
      ctx.fillStyle = color;
      const legH = height - liftHeight;
      const taperWidth = 5; 
      ctx.beginPath();
      ctx.moveTo(-taperWidth, 0); 
      ctx.quadraticCurveTo(-taperWidth - 1, legH * 0.4, -2.5, legH); 
      ctx.arc(0, legH, 2.8, Math.PI, 0, true);
      ctx.quadraticCurveTo(taperWidth + 1, legH * 0.4, taperWidth, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    if (action === 'stand' || action === 'walk' || action === 'crouch') {
      const legBaseY = action === 'crouch' ? 30 : 35;
      const legHeight = action === 'crouch' ? 18 : 34; 
      const gait1 = action === 'walk' ? walkCycle : 0;
      const gait2 = action === 'walk' ? (walkCycle + 0.5) % 1 : 0;
      drawElegantLeg(-16, legBaseY, legHeight, gait1, false); 
      drawElegantLeg(14, legBaseY, legHeight, gait2, false);  
      drawElegantLeg(-24, legBaseY + 2, legHeight - 2, gait2, true); 
      drawElegantLeg(22, legBaseY + 2, legHeight - 2, gait1, true);  
    }

    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const config = {
        color,
        action: getDisplayAction(),
        scale,
        rotation,
        mood: getDisplayMood(),
        isBlinkingNow: isBlinking,
        earWiggleVal: earWiggle,
        walkCycle,
        facingLeft
      };
      drawCat(ctx, config);
      raf = requestAnimationFrame(render);
    };
    
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [color, state, scale, rotation, actionOverride, moodOverride, isBlinking, earWiggle, walkCycle, facingLeft]);

  return (
    <canvas 
      ref={canvasRef} 
      width={200} 
      height={240} 
      className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700"
    />
  );
};

export default AnimatedCat;
