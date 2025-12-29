
import React, { useRef, useEffect, useState } from 'react';
import { PalBotState, PersonalityTraits } from '../types';

interface AnimatedCatProps {
  color: string;
  colorId?: string;
  state: PalBotState;
  scale?: number;
  personality: PersonalityTraits;
  earFoldLevel?: number; 
  eyeState?: 'default' | 'amber'; 
  actionOverride?: 'sit' | 'sleep' | 'jump' | 'stand' | 'crouch' | 'walk';
  rotation?: number;
  walkCycle?: number;
  facingLeft?: boolean;
}

const AnimatedCat: React.FC<AnimatedCatProps> = ({ 
  color: baseColor, 
  state, 
  scale = 1, 
  personality,
  earFoldLevel = 0,
  eyeState = 'default',
  actionOverride,
  rotation = 0,
  walkCycle = 0,
  facingLeft = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    const triggerBlink = () => {
      const baseInterval = Math.random() * 5000 + 4000;
      const multiplier = 1 + (personality.calmness / 40);
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          triggerBlink();
        }, 150);
      }, baseInterval * multiplier);
    };
    triggerBlink();
    return () => clearTimeout(blinkTimeout);
  }, [personality.calmness]);

  const getDisplayAction = () => {
    if (actionOverride) return actionOverride;
    return state === PalBotState.INTERACTION ? 'stand' : 'sit';
  };

  const drawCat = (ctx: CanvasRenderingContext2D, config: any) => {
    const { color, action, scale, rotation, isBlinkingNow, walkCycle, facingLeft, earFold, currentEyeState } = config;
    const centerX = 100;
    const centerY = 155; 

    const adjustColor = (hex: string, amount: number) => {
      const clamp = (val: number) => Math.min(Math.max(val, 0), 255);
      const r = clamp(parseInt(hex.slice(1, 3), 16) + amount);
      const g = clamp(parseInt(hex.slice(3, 5), 16) + amount);
      const b = clamp(parseInt(hex.slice(5, 7), 16) + amount);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    ctx.save();
    ctx.translate(centerX, centerY);
    if (facingLeft) ctx.scale(-1, 1);
    
    ctx.rotate(rotation);
    if (action === 'sit') ctx.scale(1, 0.92);
    ctx.scale(scale, scale);

    // 1. 躯干
    const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 65);
    bodyGrad.addColorStop(0, adjustColor(color, 8));
    bodyGrad.addColorStop(1, adjustColor(color, -12));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 42, 58, 0, 0, Math.PI * 2);
    ctx.fill();

    const headY = -62;
    const headW = 38;
    const headH = 32;

    // 2. 耳朵 - 严格贴合逻辑
    const drawEar = (isLeft: boolean) => {
      ctx.save();
      const basePivotX = 18; 
      const basePivotY = -24; 
      const pivotX = isLeft ? -basePivotX : basePivotX;
      const pivotY = headY + basePivotY;
      ctx.translate(pivotX, pivotY);
      
      const baseRot = 0.5; 
      const foldRot = 0.3 * earFold; 
      ctx.rotate(isLeft ? -(baseRot + foldRot) : (baseRot + foldRot));
      
      const earH = -42; 
      const earBaseW = 16;
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-earBaseW, 5); 
      ctx.quadraticCurveTo(0, earH, earBaseW, 5);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#FFE4E1';
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.moveTo(-(earBaseW - 6), 2);
      ctx.quadraticCurveTo(0, earH + 15, (earBaseW - 6), 2);
      ctx.fill();
      ctx.restore();
    };
    drawEar(true); drawEar(false);

    // 3. 头部 - 遮盖耳朵缝隙
    const headGrad = ctx.createRadialGradient(0, headY, 0, 0, headY, headW + 5);
    headGrad.addColorStop(0, adjustColor(color, 15));
    headGrad.addColorStop(0.7, color);
    headGrad.addColorStop(1, adjustColor(color, -20));
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, headY, headW, headH, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- 新增：额头三彩纹 (智慧纹) ---
    const drawForeheadMarks = () => {
      ctx.save();
      ctx.translate(0, headY - 14); // 定位于双眼之间的上方
      
      const markColor = currentEyeState === 'amber' ? '#FFD700' : 'rgba(218, 165, 32, 0.4)';
      const markGlow = currentEyeState === 'amber' ? 15 : 0;
      
      if (markGlow > 0) {
        ctx.shadowBlur = markGlow;
        ctx.shadowColor = '#FFD700';
      }
      
      ctx.fillStyle = markColor;
      
      // 绘制三道垂直火焰纹路
      const drawMark = (ox: number, oy: number, w: number, h: number) => {
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.bezierCurveTo(ox - w, oy + h * 0.5, ox - w * 0.5, oy + h, ox, oy + h);
        ctx.bezierCurveTo(ox + w * 0.5, oy + h, ox + w, oy + h * 0.5, ox, oy);
        ctx.fill();
      };
      
      // 中间主纹 (较高)
      drawMark(0, -6, 3, 14);
      // 左侧纹
      ctx.save();
      ctx.rotate(-0.2);
      drawMark(-7, -2, 2.5, 10);
      ctx.restore();
      // 右侧纹
      ctx.save();
      ctx.rotate(0.2);
      drawMark(7, -2, 2.5, 10);
      ctx.restore();
      
      ctx.restore();
    };
    drawForeheadMarks();

    // 4. 五官
    const eyeY = headY + 3; 
    const drawEye = (isLeft: boolean) => {
      const ex = isLeft ? -18 : 18;
      if (isBlinkingNow) {
        ctx.strokeStyle = adjustColor(color, -60);
        ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(ex - 8, eyeY); ctx.lineTo(ex + 8, eyeY); ctx.stroke();
      } else {
        const irisGrad = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, 9);
        if (currentEyeState === 'amber') {
          irisGrad.addColorStop(0, '#FFFACD'); irisGrad.addColorStop(0.4, '#FFD700'); irisGrad.addColorStop(1, '#B87333');
        } else {
          irisGrad.addColorStop(0, '#E0FFFF'); irisGrad.addColorStop(0.6, '#40E0D0'); irisGrad.addColorStop(1, '#20B2AA');
        }
        ctx.fillStyle = irisGrad;
        ctx.beginPath(); ctx.arc(ex, eyeY, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath(); ctx.ellipse(ex, eyeY, 2.5, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath(); ctx.arc(ex - 3, eyeY - 3, 2, 0, Math.PI * 2); ctx.fill();
      }
    };
    drawEye(true); drawEye(false);

    // 鼻口
    const noseY = headY + 15;
    ctx.fillStyle = '#F4A460';
    ctx.beginPath(); ctx.moveTo(0, noseY); ctx.lineTo(-2, noseY - 2); ctx.lineTo(2, noseY - 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1;
    const mouthY = noseY + 4;
    ctx.beginPath(); ctx.moveTo(-5, mouthY); ctx.quadraticCurveTo(0, mouthY + 2, 5, mouthY); ctx.stroke();

    // 尾巴
    ctx.save();
    ctx.translate(28, 12);
    let curX = 0, curY = 0, tAng = -0.7;
    for (let i = 0; i < 12; i++) {
      tAng += Math.sin((Date.now()/1500) - i*0.45) * 0.15;
      curX += Math.cos(tAng) * 6; curY += Math.sin(tAng) * 6;
      ctx.lineWidth = 14 * (1 - i/16); ctx.strokeStyle = adjustColor(color, -i * 1.5);
      ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(curX - Math.cos(tAng)*6, curY - Math.sin(tAng)*6); ctx.lineTo(curX, curY); ctx.stroke();
    }
    ctx.restore();
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
      drawCat(ctx, {
        color: baseColor, action: getDisplayAction(), scale, rotation,
        isBlinkingNow: isBlinking, walkCycle, facingLeft, earFold: earFoldLevel,
        currentEyeState: eyeState
      });
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [baseColor, state, scale, rotation, actionOverride, isBlinking, walkCycle, facingLeft, earFoldLevel, eyeState]);

  return <canvas ref={canvasRef} width={200} height={240} className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]" />;
};

export default AnimatedCat;
