import React, { useState } from 'react';
import { AcceptanceTestResult } from '../../types/domain';
import { api } from '../../services/apiClient';
import { Modal, Button } from '../design-system';
import {
  CheckCircle2,
  XCircle,
  Play,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';

interface AcceptanceTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcceptanceTestModal: React.FC<AcceptanceTestModalProps> = ({ isOpen, onClose }) => {
  const [running, setRunning] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [testSuite, setTestSuite] = useState<{
    all_passed: boolean;
    total_tests: number;
    passed_tests: number;
    results: AcceptanceTestResult[];
  } | null>(null);

  const handleRunTests = async () => {
    try {
      setRunning(true);
      const res = await api.runAcceptanceTests();
      setTestSuite(res);
    } catch (err: any) {
      alert(err?.message || 'Ошибка запуска acceptance-тестов');
    } finally {
      setRunning(false);
    }
  };

  const handleCopyReport = () => {
    if (!testSuite) return;
    const reportText = [
      `=== BE&MOON ACCEPTANCE TEST REPORT ===`,
      `Status: ${testSuite.all_passed ? 'ALL TESTS PASSED' : 'FAILURES DETECTED'} (${testSuite.passed_tests}/${testSuite.total_tests})`,
      `Timestamp: ${new Date().toISOString()}`,
      `---------------------------------------`,
      ...testSuite.results.map((r, i) => {
        const steps = r.diagnosticSteps
          ? r.diagnosticSteps
              .map(
                (s) =>
                  `    - [${s.status.toUpperCase()}] ${s.step} | Exp: ${s.expected} | Act: ${s.actual}`
              )
              .join('\n')
          : '';
        return `[#${i + 1}] ${r.name} - ${r.passed ? 'PASSED' : 'FAILED'} (${r.executionTimeMs}ms)\n  Details: ${r.details}\n${steps}`;
      }),
    ].join('\n');

    navigator.clipboard?.writeText(reportText);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Acceptance-тесты спецификации (Section 49 & 27)"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <p className="text-xs text-[#6E6779] leading-relaxed">
          Автоматическая валидация 15 ключевых критериев надежности BE&MOON (включая ревизию 01:
          единая сущность User, структурированная история клиента, действие [Повторить], двустороннее
          согласие на публикацию и сквозная воронка от референса к повтору).
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white/90 rounded-2xl border border-[#EDE8F3]">
          <div className="flex items-center gap-2">
            <ShieldCheck
              className={`w-5 h-5 ${testSuite?.all_passed ? 'text-[#2E7D32]' : 'text-[#6B5B95]'}`}
            />
            <div>
              <div className="text-xs font-bold text-[#2D2738]">
                {testSuite
                  ? `${testSuite.passed_tests} из ${testSuite.total_tests} тестов пройдено`
                  : '10 проверочных тестов бэкенда'}
              </div>
              <div className="text-[10px] text-[#7E748E]">
                Полный диагностический трейс для каждого шага
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {testSuite && (
              <button
                onClick={handleCopyReport}
                className="px-3 py-1.5 rounded-xl border border-[#EDE8F3] text-[11px] font-semibold text-[#554D63] hover:bg-[#FAF8FD] flex items-center gap-1 transition-colors"
              >
                {copiedLogs ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLogs ? 'Скопировано' : 'Экспорт логов'}</span>
              </button>
            )}
            <Button
              variant="want"
              size="sm"
              disabled={running}
              icon={Play}
              onClick={handleRunTests}
            >
              {running ? 'Исполнение...' : 'Запустить все тесты'}
            </Button>
          </div>
        </div>

        {/* Results List */}
        {testSuite && (
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
            {testSuite.results.map((t) => {
              const isExpanded = expandedTestId === t.id;
              return (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    t.passed
                      ? 'border-[#E2F0E5] bg-[#F9FCF9]'
                      : 'border-[#FCE8E6] bg-[#FFF9F9]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-[#2D2738]">{t.name}</div>
                        <span className="text-[10px] text-[#7E748E] font-mono tabular-nums">
                          {t.executionTimeMs} ms
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6E6779] mt-0.5">{t.description}</div>

                      <div
                        className={`text-[11px] mt-1.5 p-2 rounded-xl border ${
                          t.passed
                            ? 'text-[#2E7D32] bg-white/90 border-[#DDEFE1]'
                            : 'text-[#C62828] bg-white/90 border-[#FADCD9]'
                        }`}
                      >
                        {t.passed ? '✓' : '✗'} {t.details}
                      </div>

                      {/* Diagnostic Steps Toggle */}
                      {t.diagnosticSteps && t.diagnosticSteps.length > 0 && (
                        <div className="mt-2">
                          <button
                            onClick={() => setExpandedTestId(isExpanded ? null : t.id)}
                            className="text-[10px] font-semibold text-[#6B5B95] hover:underline flex items-center gap-1"
                          >
                            <Terminal className="w-3 h-3" />
                            <span>
                              {isExpanded ? 'Скрыть шаги диагностики' : `Диагностический лог (${t.diagnosticSteps.length} шага)`}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-1.5 p-2.5 bg-black/[0.03] rounded-xl text-[10px] font-mono">
                              {t.diagnosticSteps.map((step, idx) => (
                                <div
                                  key={idx}
                                  className="border-b border-black/[0.04] pb-1 last:border-none last:pb-0"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-[#2D2738]">
                                      Шаг {idx + 1}: {step.step}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                        step.status === 'passed'
                                          ? 'bg-[#E2F0E5] text-[#2E7D32]'
                                          : 'bg-[#FCE8E6] text-[#C62828]'
                                      }`}
                                    >
                                      {step.status.toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="text-[#6E6779] mt-0.5">
                                    Ожидалось: {step.expected}
                                  </div>
                                  <div className="text-[#2D2738]">
                                    Фактически: {step.actual}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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

