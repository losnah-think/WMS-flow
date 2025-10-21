'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Flow } from '@/models/types';

interface StepDetailsModalProps {
  flow: Flow;
  step: Flow['steps'][0];
  stepIndex: number;
  flowType: string;
  onClose: () => void;
}

export const StepDetailsModal: React.FC<StepDetailsModalProps> = ({
  flow,
  step,
  stepIndex,
  flowType,
  onClose,
}) => {
  const t = useTranslations();
  const fromActor = flow.actors.find(a => a.id === step.from);
  const toActor = flow.actors.find(a => a.id === step.to);

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex justify-between items-start gap-4 shadow-md">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white bg-opacity-30 flex items-center justify-center font-bold text-lg">
                {stepIndex + 1}
              </div>
              <h2 className="text-2xl font-bold">{step.label}</h2>
            </div>
            <p className="text-blue-100 text-sm">
              {flow.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">{t('status.processInfo')}</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">{t('status.processFlow')}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                    {fromActor?.name}
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                    {toActor?.name}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">{t('components.description')}</p>
                <p className="font-semibold text-gray-900">{step.actor}</p>
              </div>
              {step.term && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('components.term')}</p>
                  <p className="font-semibold text-gray-900">{step.term}</p>
                </div>
              )}
            </div>
          </section>

          {/* 설명 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">{t('status.description')}</h3>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4">
              {step.desc}
            </p>
          </section>

          {/* 상세 내용 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">{t('status.detail')}</h3>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4">
              {step.detail}
            </p>
          </section>

          {/* 액터 정보 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">참여 시스템</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">시작</p>
                <p className="font-semibold text-gray-900">{fromActor?.name}</p>
                <p className="text-xs text-gray-600">{fromActor?.layer}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">종료</p>
                <p className="font-semibold text-gray-900">{toActor?.name}</p>
                <p className="text-xs text-gray-600">{toActor?.layer}</p>
              </div>
            </div>
          </section>

          {/* WMS 기능 */}
          {step.features && step.features.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">관련 WMS 기능</h3>
              <div className="space-y-2">
                {step.features.map((featureId) => {
                  return (
                    <div key={featureId} className="border-l-4 border-green-500 bg-green-50 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {featureId}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {t(`features.${featureId}-desc`) || '기능 설명 없음'}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded whitespace-nowrap">
                          {t(`features.${featureId}-importance`) || '중요도 정보 없음'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </>
  );
};
