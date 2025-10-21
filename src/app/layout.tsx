import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FULGO WMS - 3계층 프로세스 플로우',
  description: 'FULGO WMS의 입고, 출고, 반품, 보관 프로세스를 시각화한 플로우 차트',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
