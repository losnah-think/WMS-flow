// src/hooks/useDownloadDiagram.ts
'use client';

import html2canvas from 'html2canvas';

export const useDownloadDiagram = () => {
  const downloadDiagramAsPNG = async (filename: string = 'flow-diagram') => {
    try {
      // SVG을 포함한 부모 컨테이너 찾기
      const container = document.querySelector('.w-full.overflow-x-auto.border-2');
      if (!container) {
        console.error('Diagram container not found');
        return;
      }

      // html2canvas로 컨테이너를 캔버스로 변환
      const canvas = await html2canvas(container as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2, // 고해상도
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // 캔버스를 blob으로 변환
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.png`;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error downloading diagram as PNG:', error);
      alert('다이어그램 다운로드에 실패했습니다. 다시 시도해주세요.');
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

      // 현재 계산된 스타일 가져오기
      const allElements = svgClone.querySelectorAll('*');
      allElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element as Element);
        if (computedStyle.fill) {
          (element as SVGElement).setAttribute('fill', computedStyle.fill);
        }
        if (computedStyle.stroke) {
          (element as SVGElement).setAttribute('stroke', computedStyle.stroke);
        }
        if (computedStyle.strokeWidth) {
          (element as SVGElement).setAttribute('stroke-width', computedStyle.strokeWidth);
        }
        if (computedStyle.opacity) {
          (element as SVGElement).setAttribute('opacity', computedStyle.opacity);
        }
      });

      // XML 선언 추가
      const svgString = new XMLSerializer().serializeToString(svgClone);
      const fullSVG = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
      
      const blob = new Blob([fullSVG], { type: 'image/svg+xml;charset=utf-8' });
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
      alert('다이어그램 다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return {
    downloadDiagramAsPNG,
    downloadDiagramAsSVG,
  };
};
