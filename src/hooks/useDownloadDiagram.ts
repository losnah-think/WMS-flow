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

      // SVG 크기 가져오기
      const width = svgElement.clientWidth;
      const height = svgElement.clientHeight;

      // Canvas 생성
      const canvas = document.createElement('canvas');
      const scale = window.devicePixelRatio || 1;
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Canvas context not found');
        return;
      }

      // 배경을 흰색으로 설정
      ctx.scale(scale, scale);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);

      // SVG를 blob으로 변환
      const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
      const svgString = new XMLSerializer().serializeToString(svgClone);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      // 이미지 로드 및 캔버스에 그리기
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        // 캔버스를 이미지로 다운로드
        canvas.toBlob((canvasBlob) => {
          if (canvasBlob) {
            const downloadUrl = URL.createObjectURL(canvasBlob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${filename}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
          }
        }, 'image/png');
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

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.svg`;
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
