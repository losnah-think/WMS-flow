'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Flow } from '@/models/types';
import { features } from '@/models/featureData';

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
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-[900px] md:max-w-[90vw] max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 overflow-y-auto">
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
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center hover:bg-white hover:bg-opacity-20 rounded-full transition"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">기본 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">단계</p>
                <p className="text-xl font-bold text-blue-600">{stepIndex + 1} / {flow.steps.length}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">시간</p>
                <p className="text-xl font-bold text-green-600">{step.duration}ms</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">유형</p>
                <p className="text-xl font-bold text-purple-600">{step.type}</p>
              </div>
            </div>
          </section>

          {/* 설명 */}
          {step.description && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">설명</h3>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-gray-800 leading-relaxed">{step.description}</p>
              </div>
            </section>
          )}

          {/* 참여자 정보 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">참여 대상</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* From */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-3">요청자</p>
                <p className="font-semibold text-gray-900">{fromActor?.name}</p>
                <p className="text-xs text-gray-600">{fromActor?.layer}</p>
              </div>

              {/* To */}
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-3">요청처</p>
                <p className="font-semibold text-gray-900">{toActor?.name}</p>
                <p className="text-xs text-gray-600">{toActor?.layer}</p>
              </div>
            </div>
          </section>

          {/* 요구사항 */}
          {step.features && step.features.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                {t('modal.requirements')}
              </h3>
              <div className="space-y-4">
                {step.features.map((featureId) => {
                  const feature = features.find(f => f.id === featureId);
                  const priorityColors = {
                    high: 'border-red-300 bg-red-50',
                    medium: 'border-yellow-300 bg-yellow-50',
                    low: 'border-green-300 bg-green-50'
                  };
                  const priorityBadgeColors = {
                    high: 'bg-red-100 text-red-800',
                    medium: 'bg-yellow-100 text-yellow-800',
                    low: 'bg-green-100 text-green-800'
                  };

                  return (
                    <div
                      key={featureId}
                      className={`border-2 rounded-lg p-4 ${
                        feature ? priorityColors[feature.priority] : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      {/* 요구사항 헤더 */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-gray-900">{featureId}</span>
                          {feature && (
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${priorityBadgeColors[feature.priority]}`}>
                              {t(`modal.priority.${feature.priority}`)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 요구사항 이름 */}
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {t(`features.${featureId}-name`)}
                      </h4>

                      {/* 요구사항 설명 */}
                      <p className="text-sm text-gray-700 mb-3">
                        {t(`features.${featureId}-desc`)}
                      </p>

                      {/* 상세 정보 그리드 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {/* 입력 */}
                        <div className="bg-white bg-opacity-60 rounded p-3">
                          <p className="font-semibold text-gray-700 mb-1 text-xs uppercase">
                            {t('modal.input')}
                          </p>
                          <p className="text-gray-800 whitespace-pre-line">
                            {t(`features.${featureId}-input`)}
                          </p>
                        </div>

                        {/* 출력 */}
                        <div className="bg-white bg-opacity-60 rounded p-3">
                          <p className="font-semibold text-gray-700 mb-1 text-xs uppercase">
                            {t('modal.output')}
                          </p>
                          <p className="text-gray-800 whitespace-pre-line">
                            {t(`features.${featureId}-output`)}
                          </p>
                        </div>
                      </div>

                      {/* 처리 과정 */}
                      <div className="mt-3 bg-white bg-opacity-60 rounded p-3">
                        <p className="font-semibold text-gray-700 mb-1 text-xs uppercase">
                          {t('modal.process')}
                        </p>
                        <p className="text-gray-800 text-sm whitespace-pre-line">
                          {t(`features.${featureId}-process`)}
                        </p>
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
