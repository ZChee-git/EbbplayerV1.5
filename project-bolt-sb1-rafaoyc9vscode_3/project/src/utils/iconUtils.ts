/**
 * PWA图标生成和验证工具
 */

// 创建一个简单的SVG图标作为fallback
export const createFallbackIcon = (size: number, color: string = '#2563eb'): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="${color}" rx="${size * 0.1}"/>
      <polygon points="${size * 0.3},${size * 0.35} ${size * 0.3},${size * 0.65} ${size * 0.7},${size * 0.5}" fill="white"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// 验证图标文件是否有效
export const validateIcon = async (iconUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(iconUrl);
    if (!response.ok) {
      return false;
    }
    
    const blob = await response.blob();
    return blob.size > 0 && blob.type.startsWith('image/');
  } catch (error) {
    console.warn('Icon validation failed:', error);
    return false;
  }
};

// 创建Canvas图标
export const createCanvasIcon = (size: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }
    
    canvas.width = size;
    canvas.height = size;
    
    // 绘制背景
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 0, size, size);
    
    // 绘制圆角矩形
    const radius = size * 0.15;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(size * 0.15, size * 0.15, size * 0.7, size * 0.7, radius);
    ctx.fill();
    
    // 绘制播放按钮
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    const centerX = size / 2;
    const centerY = size / 2;
    const triangleSize = size * 0.12;
    
    ctx.moveTo(centerX - triangleSize * 0.3, centerY - triangleSize);
    ctx.lineTo(centerX - triangleSize * 0.3, centerY + triangleSize);
    ctx.lineTo(centerX + triangleSize * 0.8, centerY);
    ctx.closePath();
    ctx.fill();
    
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob'));
      }
    }, 'image/png');
  });
};

// 下载图标文件
export const downloadIcon = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default {
  createFallbackIcon,
  validateIcon,
  createCanvasIcon,
  downloadIcon
};
