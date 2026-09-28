import { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  Award,
  Calendar,
  X,
  Copy,
  Check,
} from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: string;
  onSelectUser?: (userId: string) => void;
  onSelectMaster?: (userId: string) => void;
}

export function CertificateModal({
  isOpen,
  onClose,
  initialToken,
  onSelectUser,
  onSelectMaster,
}: CertificateModalProps) {
  const [tokenInput, setTokenInput] = useState(initialToken || 'vtok_elena_nail_cert');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    status: string;
    certificate?: any;
    school?: any;
    graduate?: any;
    tamper_proof_checksum?: string;
    error?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialToken) {
      setTokenInput(initialToken);
      verifyToken(initialToken);
    } else if (isOpen && !result) {
      verifyToken('vtok_elena_nail_cert');
    }
  }, [initialToken, isOpen]);

  const verifyToken = async (tok: string) => {
    if (!tok.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.verifyCertificate(tok.trim());
      setResult(res);
    } catch (err: any) {
      setResult({
        valid: false,
        status: 'error',
        error: err?.message || 'Сертификат с таким токеном не найден в реестре',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && result?.certificate?.verification_token) {
      navigator.clipboard?.writeText(
        `https://be-moon.app/verify/${result.certificate.verification_token}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="moon-card w-full max-w-lg rounded-3xl p-6 border border-[#EDE8F3] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#6B5B95]/10 text-[#6B5B95] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D2738]">
                Реестр верификации дипломов BE&MOON
              </h3>
              <p className="text-[11px] text-[#7E748E]">
                Криптографическая защита от подделки и привязка к мастеру
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7E748E] hover:bg-[#F3EEF7] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search / Verification Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8299]" />
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Введите токен (vtok_...) или номер (BM-ACAD-...)"
              className="w-full h-11 pl-10 pr-3 rounded-2xl bg-white border border-[#EDE8F3] text-xs font-mono text-[#2D2738] focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/20 focus:border-[#6B5B95]"
            />
          </div>
          <button
            onClick={() => verifyToken(tokenInput)}
            disabled={loading}
            className="px-4 h-11 rounded-2xl bg-[#6B5B95] text-white text-xs font-semibold hover:bg-[#58355E] transition-colors disabled:opacity-50"
          >
            {loading ? 'Проверка...' : 'Проверить'}
          </button>
        </div>

        {/* Verification Result */}
        {loading && (
          <div className="py-12 text-center text-[#7E748E]">
            <div className="w-8 h-8 border-2 border-[#6B5B95] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Запрос к децентрализованному реестру BE&MOON...</p>
          </div>
        )}

        {!loading && result && (
          <div>
            {result.valid ? (
              <div className="relative overflow-hidden rounded-3xl p-6 moon-card-warm border-2 border-[#E9DFCF] shadow-sm space-y-4">
                {/* Official Certificate Header */}
                <div className="flex items-center justify-between border-b border-[#EFEAE2] pb-3">
                  <div className="flex items-center gap-2.5">
                    {result.school?.logo && (
                      <img
                        src={result.school.logo}
                        alt={result.school.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[#E9DFCF]"
                      />
                    )}
                    <div>
                      <div className="text-xs font-bold text-[#2D2738]">
                        {result.school?.name || 'BE&MOON Academy'}
                      </div>
                      <div className="text-[10px] text-[#7E748E]">
                        {result.school?.city || 'Санкт-Петербург'} · Аккредитованный центр
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EBF7EE] text-[#2E7D32] text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ПОДЛИННЫЙ</span>
                  </div>
                </div>

                {/* Certificate Title */}
                <div className="text-center py-2">
                  <Award className="w-8 h-8 mx-auto text-[#6B5B95] mb-1" />
                  <div className="text-[10px] uppercase font-bold tracking-widest text-[#7E748E]">
                    Официальный сертификат
                  </div>
                  <h4 className="text-sm font-bold text-[#2D2738] mt-0.5">
                    {result.certificate?.title || 'Квалификационный диплом'}
                  </h4>
                </div>

                {/* Graduate Info */}
                <div className="bg-white/80 p-3.5 rounded-2xl border border-[#EDE8F3] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.graduate?.avatar && (
                      <img
                        src={result.graduate.avatar}
                        alt={result.graduate.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                    )}
                    <div>
                      <div className="text-[10px] text-[#7E748E]">Выдан мастеру:</div>
                      <div className="text-xs font-bold text-[#2D2738]">
                        {result.graduate?.name || result.certificate?.graduate_name}
                      </div>
                      <div className="text-[10px] text-[#554D63]">
                        {result.graduate?.profession || 'Мастер'}
                      </div>
                    </div>
                  </div>

                  {(result.graduate?.user_id || result.graduate?.master_id) && (
                    <button
                      onClick={() => {
                        const target = result.graduate?.user_id || result.graduate?.master_id;
                        onClose();
                        if (onSelectUser) onSelectUser(target!);
                        else if (onSelectMaster) onSelectMaster(target!);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF8FD] border border-[#EDE8F3] text-[11px] font-semibold text-[#6B5B95] hover:bg-[#F4ECF8] transition-colors flex items-center gap-1"
                    >
                      <span>В профиль</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white/60 p-2.5 rounded-xl border border-[#EDE8F3]">
                    <span className="text-[#7E748E] block text-[10px]">Номер диплома:</span>
                    <span className="font-mono font-bold text-[#2D2738]">
                      {result.certificate?.certificate_number}
                    </span>
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-xl border border-[#EDE8F3]">
                    <span className="text-[#7E748E] block text-[10px]">Дата выдачи:</span>
                    <span className="font-medium text-[#2D2738]">
                      {result.certificate?.issued_at
                        ? new Date(result.certificate.issued_at).toLocaleDateString('ru-RU')
                        : 'Верифицировано'}
                    </span>
                  </div>
                </div>

                {/* Tamper Proof Fingerprint */}
                <div className="bg-[#FAF8FD] p-2.5 rounded-xl border border-[#E9E4F0] flex items-center justify-between text-[10px] text-[#7E748E]">
                  <span className="font-mono truncate max-w-[260px]">
                    Хэш: {result.tamper_proof_checksum}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 text-[#6B5B95] font-semibold hover:underline"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Скопировано' : 'Ссылка'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-[#FDF2F2] border border-[#F9D2D2] text-center space-y-2">
                <XCircle className="w-8 h-8 mx-auto text-[#D32F2F]" />
                <h4 className="text-sm font-bold text-[#D32F2F]">Сертификат не подтвержден</h4>
                <p className="text-xs text-[#7A1C1C] max-w-sm mx-auto">
                  {result.error ||
                    'Введенный токен не зарегистрирован в реестре или отозван аккредитованным учебным заведением.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
