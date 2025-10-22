// src/hooks/useDownloadDiagram.ts
'use client';

export const useDownloadDiagram = () => {
  const downloadDiagramAsPNG = async (filename: string = 'flow-diagram') => {
    try {
      const svgElement = document.querySelector('svg');
      if (!svgElement) {
        console.error('SVG element not found');
        return;
      }

      // SVG의 실제 크기 (viewBox 기준)
      const viewBox = svgElement.getAttribute('viewBox');
      const match = viewBox?.match(/0 0 ([\d.]+) ([\d.]+)/);
      let width = svgElement.clientWidth;
      let height = svgElement.clientHeight;

      if (match) {
        width = parseInt(match[1], 10);
        height = parseInt(match[2], 10);
      }

      // Canvas 생성
      const canvas = document.createElement('canvas');
      const scale = 2; // 고해상도 다운로드
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Canvas context not found');
        return;
      }

      // 배경을 흰색으로 설정
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width * scale, height * scale);

      // SVG Clone 생성 및 스타일 추가
      const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
      svgClone.setAttribute('width', String(width * scale));
      svgClone.setAttribute('height', String(height * scale));

      // 스타일 정보 추가
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .flow-line-active { animation: none; }
        .step-circle-active { animation: none; }
      `;
      svgClone.insertBefore(styleElement, svgClone.firstChild);

      const svgString = new XMLSerializer().serializeToString(svgClone);
      
      // UTF-8 인코딩 추가
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // 이미지 로드 및 캔버스에 그리기
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        // 캔버스를 PNG로 변환
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${filename}.png`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
          }
        }, 'image/png', 1.0);
      };

      img.onerror = () => {
        console.error('Failed to load SVG as image');
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      console.error('Error downloading diagram as PNG:', error);
    }
  };

  const downloadDiagramAsSVG = (filename: string = 'flow-diagram') => {
    try {
      const svgElement = document.querySelector('svg');
      if (!svgElement) {
        console.error('SVG element not found');
        return;
      }

      // SVG 복제
      const svgClone = svgElement.cloneNode(true) as SVGSVGElement;

      // 스타일 정보 추가
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .flow-line-active { animation: none; }
        .step-circle-active { animation: none; }
      `;
      svgClone.insertBefore(styleElement, svgClone.firstChild);

      const svgData = new XMLSerializer().serializeToString(svgClone);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.svg`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading diagram as SVG:', error);
    }
  };

  return {
    downloadDiagramAsPNG,
    downloadDiagramAsSVG,
  };
};
