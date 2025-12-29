
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
        // 缩短眨眼时长以适应更复杂的上下眨眼动作
        setTimeout(() => {
          setIsBlinking(false);
          triggerBlink();
        }, 120);
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
    const centerY = 148; 

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

    // --- 1. 优雅尾巴 ---
    ctx.save();
    ctx.translate(22, 18);
    let curX = 0, curY = 0;
    let tAng = -0.8;
    const timeStep = Date.now() / 3000;
    const segments = 24;
    for (let i = 0; i < segments; i++) {
      tAng += Math.sin(timeStep - i * 0.18) * 0.065;
      const nextX = curX + Math.cos(tAng) * 4.2;
      const nextY = curY + Math.sin(tAng) * 4.2;
      ctx.lineWidth = 16 * Math.pow(1 - i / segments, 0.75);
      ctx.strokeStyle = adjustColor(color, -i * 1.5);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(curX, curY);
      ctx.lineTo(nextX, nextY);
      ctx.stroke();
      curX = nextX;
      curY = nextY;
    }
    ctx.restore();

    // 2. 躯干
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

    // 3. 耳朵
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

    // 4. 头部
    const headGrad = ctx.createRadialGradient(0, headY, 0, 0, headY, headW + 5);
    headGrad.addColorStop(0, adjustColor(color, 15));
    headGrad.addColorStop(0.7, color);
    headGrad.addColorStop(1, adjustColor(color, -20));
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, headY, headW, headH, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. 额头三彩纹
    const drawForeheadMarks = () => {
      ctx.save();
      ctx.translate(0, headY - 14); 
      const markColor = currentEyeState === 'amber' ? '#FFD700' : 'rgba(218, 165, 32, 0.4)';
      const markGlow = currentEyeState === 'amber' ? 15 : 0;
      if (markGlow > 0) {
        ctx.shadowBlur = markGlow;
        ctx.shadowColor = '#FFD700';
      }
      ctx.fillStyle = markColor;
      const drawMark = (ox: number, oy: number, w: number, h: number) => {
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.bezierCurveTo(ox - w, oy + h * 0.5, ox - w * 0.5, oy + h, ox, oy + h);
        ctx.bezierCurveTo(ox + w * 0.5, oy + h, ox + w, oy + h * 0.5, ox, oy);
        ctx.fill();
      };
      drawMark(0, -6, 3, 14);
      ctx.save(); ctx.rotate(-0.2); drawMark(-7, -2, 2.5, 10); ctx.restore();
      ctx.save(); ctx.rotate(0.2); drawMark(7, -2, 2.5, 10); ctx.restore();
      ctx.restore();
    };
    drawForeheadMarks();

    // 6. 通透晶莹琥珀眼 与 上下眨眼逻辑 (Vertical Blink)
    const eyeY = headY + 3; 
    const drawEye = (isLeft: boolean) => {
      const ex = isLeft ? -18 : 18;
      const eyeSize = 9;

      if (isBlinkingNow) {
        // --- 垂直眨眼动画状态 ---
        // 绘制眼眶阴影
        ctx.fillStyle = adjustColor(color, -30);
        ctx.beginPath(); ctx.arc(ex, eyeY, eyeSize + 1, 0, Math.PI * 2); ctx.fill();

        // 绘制上眼睑 (往下合拢)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeSize + 0.5, Math.PI, 0, false);
        ctx.lineTo(ex + eyeSize + 1, eyeY + 1); // 稍微过中线
        ctx.lineTo(ex - eyeSize - 1, eyeY + 1);
        ctx.closePath();
        ctx.fill();

        // 绘制下眼睑 (往上合拢)
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeSize + 0.5, 0, Math.PI, false);
        ctx.lineTo(ex - eyeSize - 1, eyeY - 1); // 稍微过中线
        ctx.lineTo(ex + eyeSize + 1, eyeY - 1);
        ctx.closePath();
        ctx.fill();

        // 绘制闭合缝隙线 (肉粉色一线唇缘感)
        ctx.strokeStyle = '#D48181';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ex - eyeSize + 1, eyeY);
        ctx.lineTo(ex + eyeSize - 1, eyeY);
        ctx.stroke();

      } else {
        // --- 正常睁开状态 (通透琥珀眼) ---
        // 1. 巩膜与微弱环境色 (Sclera)
        ctx.fillStyle = '#F8F8F8';
        ctx.beginPath(); ctx.arc(ex, eyeY, eyeSize + 0.5, 0, Math.PI * 2); ctx.fill();

        // 2. 虹膜深度渐变 (Iris Depth)
        const irisGrad = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, eyeSize);
        irisGrad.addColorStop(0, '#FFFBEB');
        irisGrad.addColorStop(0.3, '#F59E0B');
        irisGrad.addColorStop(0.7, '#B45309');
        irisGrad.addColorStop(1, '#451A03');

        ctx.save();
        if (currentEyeState === 'amber') {
          ctx.shadowBlur = 12;
          ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
        }
        ctx.fillStyle = irisGrad;
        ctx.beginPath(); ctx.arc(ex, eyeY, eyeSize, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // 3. 折射反光层
        const causticGrad = ctx.createRadialGradient(ex + 2, eyeY + 3, 0, ex + 2, eyeY + 3, 4);
        causticGrad.addColorStop(0, 'rgba(255, 251, 235, 0.5)');
        causticGrad.addColorStop(1, 'rgba(255, 251, 235, 0)');
        ctx.fillStyle = causticGrad;
        ctx.beginPath(); ctx.arc(ex, eyeY, eyeSize, 0, Math.PI * 2); ctx.fill();

        // 4. 瞳孔
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath(); ctx.ellipse(ex, eyeY, 2, 6, 0, 0, Math.PI * 2); ctx.fill();
        
        // 5. 表面主高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath(); ctx.arc(ex - 3, eyeY - 3.5, 1.6, 0, Math.PI * 2); ctx.fill();

        // 6. 侧边高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath(); ctx.arc(ex + 4, eyeY - 1, 1, 0, Math.PI * 2); ctx.fill();
      }
    };
    drawEye(true); drawEye(false);

    // 鼻子
    const noseY = headY + 14;
    ctx.fillStyle = '#F4A460';
    ctx.beginPath(); ctx.moveTo(0, noseY + 1); ctx.lineTo(-1.8, noseY - 1); ctx.lineTo(1.8, noseY - 1); ctx.fill();

    // 嘴部
    const isSpeaking = action === 'stand' || state === PalBotState.INTERACTION;
    const mouthTopY = noseY + 3.5;
    const mouthW = 7;
    const mouthH = isSpeaking ? 5 : 0.8;

    ctx.save();
    ctx.translate(0, mouthTopY);

    if (isSpeaking) {
      ctx.fillStyle = '#5A2A2A'; 
      ctx.beginPath();
      ctx.moveTo(-mouthW/2, 0);
      ctx.quadraticCurveTo(0, mouthH * 2.2, mouthW/2, 0);
      ctx.fill();

      ctx.fillStyle = '#FFB6C1';
      ctx.beginPath();
      ctx.ellipse(0, mouthH * 1.5, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = 0.9;
      for (let x = -2; x <= 2; x += 1.3) {
        ctx.beginPath();
        ctx.arc(x, 0.5, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }

    ctx.strokeStyle = '#D48181'; 
    ctx.lineWidth = 1.1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(-mouthW/2 - 0.5, -0.5); 
    ctx.quadraticCurveTo(-mouthW/4, mouthH, 0, 0.5);
    ctx.quadraticCurveTo(mouthW/4, mouthH, mouthW/2 + 0.5, -0.5); 
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 182, 193, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-mouthW/2, 0);
    ctx.quadraticCurveTo(0, mouthH + 0.5, mouthW/2, 0);
    ctx.stroke();

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
