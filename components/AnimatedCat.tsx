
import React, { useRef, useEffect, useState } from 'react';
import { PalBotState, PersonalityTraits } from '../types';

interface AnimatedCatProps {
  color: string;
  colorId?: string;
  state: PalBotState;
  scale?: number;
  personality: PersonalityTraits;
  actionOverride?: 'sit' | 'sleep' | 'jump' | 'stand' | 'crouch';
  moodOverride?: 'happy' | 'sleep' | 'neutral';
  rotation?: number;
}

const AnimatedCat: React.FC<AnimatedCatProps> = ({ 
  color, 
  colorId, 
  state, 
  scale = 1, 
  personality,
  actionOverride,
  moodOverride,
  rotation = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [earWiggle, setEarWiggle] = useState(0); // 耳朵摆动角度

  // --- 眨眼计时器逻辑 ---
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

  // --- 耳朵微动计时器逻辑 ---
  useEffect(() => {
    let wiggleTimeout: ReturnType<typeof setTimeout>;
    const triggerWiggle = () => {
      const nextWiggleIn = Math.random() * 3000 + 1000; // 1-4秒随机
      wiggleTimeout = setTimeout(() => {
        // 模拟快速抖动两次
        setEarWiggle(0.1);
        setTimeout(() => setEarWiggle(-0.05), 100);
        setTimeout(() => setEarWiggle(0.08), 200);
        setTimeout(() => {
          setEarWiggle(0);
          triggerWiggle();
        }, 300);
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
    const { color, action, scale, rotation, mood, isBlinkingNow, earWiggleVal } = config;
    const eyeColor = '#7FBF7F';
    const centerX = 100;
    const centerY = 140;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    if (action === 'sit') {
      ctx.scale(1, 0.85);
    } else if (action === 'sleep') {
      ctx.scale(1.3, 0.7);
      ctx.rotate(-Math.PI / 12);
    } else if (action === 'jump') {
      ctx.translate(0, -40);
      ctx.scale(0.95, 1.1);
    } else if (action === 'crouch') {
      ctx.scale(1.1, 0.6);
    }
    ctx.scale(scale, scale);

    // --- 尾巴 ---
    if (action !== 'sleep') {
      ctx.save();
      ctx.fillStyle = color;
      const baseX = 28;
      const baseY = 25;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      if (mood === 'happy') {
        ctx.bezierCurveTo(baseX + 30, baseY + 10, baseX + 50, baseY - 40, baseX + 30, baseY - 70);
        ctx.arc(baseX + 25, baseY - 70, 6, 0, Math.PI, true);
        ctx.bezierCurveTo(baseX + 40, baseY - 40, baseX + 20, baseY + 10, baseX - 5, baseY + 15);
      } else {
        ctx.bezierCurveTo(baseX + 25, baseY + 45, baseX - 10, baseY + 55, baseX - 45, baseY + 45);
        ctx.arc(baseX - 45, baseY + 39, 6, Math.PI / 2, Math.PI * 1.5, false);
        ctx.bezierCurveTo(baseX - 10, baseY + 45, baseX + 15, baseY + 35, baseX, baseY + 5);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // --- 身体 ---
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 45, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- 头部 ---
    ctx.beginPath();
    ctx.arc(0, -50, 35, 0, Math.PI * 2);
    ctx.fill();

    // --- 耳朵 (动态摆动设计) ---
    const drawEar = (isLeft: boolean) => {
      ctx.save();
      // 设置耳朵基部中心为旋转点
      const pivotX = isLeft ? -21 : 21;
      const pivotY = -75;
      ctx.translate(pivotX, pivotY);
      // 左右耳摆动方向相反或同步微调
      ctx.rotate(isLeft ? -earWiggleVal : earWiggleVal);
      ctx.translate(-pivotX, -pivotY);

      ctx.fillStyle = color;
      ctx.beginPath();
      if (isLeft) {
        ctx.moveTo(-10, -82);
        ctx.quadraticCurveTo(-18, -98, -26, -92);
        ctx.quadraticCurveTo(-34, -88, -32, -65);
      } else {
        ctx.moveTo(10, -82);
        ctx.quadraticCurveTo(18, -98, 26, -92);
        ctx.quadraticCurveTo(34, -88, 32, -65);
      }
      ctx.closePath();
      ctx.fill();

      // 内耳粉色
      ctx.fillStyle = '#FFB6C1';
      ctx.beginPath();
      if (isLeft) {
        ctx.moveTo(-13, -83);
        ctx.quadraticCurveTo(-18, -94, -24, -89);
        ctx.quadraticCurveTo(-30, -86, -28, -70);
      } else {
        ctx.moveTo(13, -83);
        ctx.quadraticCurveTo(18, -94, 24, -89);
        ctx.quadraticCurveTo(30, -86, 28, -70);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    drawEar(true);  // 左耳
    drawEar(false); // 右耳

    // --- 眼睛 ---
    const isSleepMood = mood === 'sleep' || action === 'sleep';
    const isActuallyBlinking = isBlinkingNow && !isSleepMood;
    ctx.fillStyle = eyeColor;
    const eyeY = (isSleepMood || isActuallyBlinking) ? -48 : -50;
    
    if (isActuallyBlinking || isSleepMood) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = eyeColor;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-18, eyeY); ctx.lineTo(-6, eyeY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, eyeY); ctx.lineTo(18, eyeY); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(-12, eyeY, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(12, eyeY, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.arc(-12, -50, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(12, -50, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(-11, -51, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(13, -51, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    // --- 鼻子/嘴巴 ---
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath(); ctx.arc(0, -43, 3.5, 0, Math.PI * 2); ctx.fill();
    if (!isSleepMood) {
      ctx.strokeStyle = '#FFB6C1';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, -43); ctx.lineTo(0, -38); ctx.stroke();
      ctx.beginPath(); ctx.arc(-5, -38, 5, 0, Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(5, -38, 5, Math.PI / 2, Math.PI); ctx.stroke();
    }

    // --- 胡须 ---
    ctx.strokeStyle = colorId === 'snow' ? '#CCCCCC' : '#AAAAAA';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(-8, -45 + i * 2); ctx.lineTo(-32, -47 + i * 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(8, -45 + i * 2); ctx.lineTo(32, -47 + i * 3); ctx.stroke();
    }

    // --- 四肢 ---
    if (action === 'stand') {
      ctx.fillStyle = color;
      ctx.fillRect(-20, 35, 8, 25); ctx.fillRect(12, 35, 8, 25);
      ctx.fillRect(-25, 40, 6, 20); ctx.fillRect(19, 40, 6, 20);
    }

    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const config = {
      color,
      action: getDisplayAction(),
      scale,
      rotation,
      mood: getDisplayMood(),
      isBlinkingNow: isBlinking,
      earWiggleVal: earWiggle
    };
    drawCat(ctx, config);
  }, [color, state, scale, rotation, actionOverride, moodOverride, isBlinking, earWiggle]);

  return (
    <canvas 
      ref={canvasRef} 
      width={200} 
      height={240} 
      className="w-full h-full object-contain drop-shadow-2xl transition-all duration-700"
    />
  );
};

export default AnimatedCat;
