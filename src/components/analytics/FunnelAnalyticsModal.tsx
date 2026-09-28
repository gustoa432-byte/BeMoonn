import React, { useState, useEffect } from 'react';
import { FunnelAnalyticsResponse } from '../../types/domain';
import { api } from '../../services/apiClient';
import { Modal, Button } from '../design-system';
import { BarChart3, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';

interface FunnelAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FunnelAnalyticsModal: React.FC<FunnelAnalyticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<FunnelAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getFunnelAnalytics();
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Профессиональный граф & Воронка конверсий"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#78716C] leading-relaxed">
            Отслеживание ключевого сценария BE&MOON: от визуального желания до подтвержденного
            визита к мастеру.
          </p>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
            title="Обновить"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* The Golden Metric Cards (Section 25 & Section 16) */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#2D2738] text-[#FAF8F5] p-4 rounded-3xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#B87333] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Золотая метрика 1
                </span>
                <span className="text-[10px] text-[#A89FB8]">Ref → «ХОЧУ»</span>
              </div>
              <div className="text-2xl font-extrabold tracking-tight tabular-nums text-white">
                {data.referenceToWantRate}%
              </div>
              <p className="text-[11px] text-[#A89FB8] pt-0.5">
                Процент показов референсов, конвертированных в прямое намерение записаться.
              </p>
            </div>

            <div className="bg-[#4A3E6D] text-[#FAF8F5] p-4 rounded-3xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Золотая метрика 2
                </span>
                <span className="text-[10px] text-[#C4BCD2]">Completed → Repeat</span>
              </div>
              <div className="text-2xl font-extrabold tracking-tight tabular-nums text-white">
                {data.completedToRepeatRate ?? 0}%
              </div>
              <p className="text-[11px] text-[#C4BCD2] pt-0.5">
                Доля выполненных услуг, завершившихся повторным визитом к тому же мастеру.
              </p>
            </div>
          </div>
        )}

        {/* Funnel Steps */}
        {data && (
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
              Шаги воронки перехода к мастеру
            </div>
            {data.steps.map((step, idx) => {
              const widthPct = Math.max(8, step.conversionFromFirst);
              return (
                <div
                  key={step.step}
                  className="bg-white p-3 rounded-2xl border border-[#EFEAE2] space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1C1917]">
                      {idx + 1}. {step.name}
                    </span>
                    <span className="font-bold text-[#1C1917] tabular-nums">
                      {step.count} событий
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-2 w-full bg-[#FAF8F5] rounded-full overflow-hidden border border-[#EFEAE2]">
                    <div
                      className="h-full bg-gradient-to-r from-[#1C1917] to-[#D9532F] rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#78716C]">
                    <span>От первого шага: {step.conversionFromFirst}%</span>
                    <span>Конверсия с пред. шага: {step.conversionFromPrev}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2">
          <Button variant="secondary" size="md" fullWidth onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>
    </Modal>
  );
};
