import React, { useState, useEffect } from 'react';
import { X, Lock, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export interface PasscodeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Passcode doğrulama + işlemi gerçekleştiren callback. true dönerse başarılı. */
  onVerify: (passcode: string) => Promise<boolean>;
  employeeName: string;
  /** Modal başlığı. Varsayılan: "Güvenli Belge Onayı" */
  title?: string;
  /** Onay butonu etiketi. actionType'dan türetilir. */
  actionLabel?: string;
  /** İşlem açıklaması */
  actionDescription?: string;
  /** Buton rengi. actionType'dan türetilir. */
  actionColor?: 'green' | 'blue' | 'red' | 'indigo';
  /** Geriye dönük uyumluluk */
  actionType?: 'approve' | 'reject';
}

const COLOR_MAP = {
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800',  btn: 'bg-green-600 hover:bg-green-700',  icon: 'text-green-600'  },
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800',    btn: 'bg-red-600 hover:bg-red-700',      icon: 'text-red-600'    },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-800',   btn: 'bg-blue-600 hover:bg-blue-700',    icon: 'text-blue-600'   },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', btn: 'bg-indigo-600 hover:bg-indigo-700',icon: 'text-indigo-600' },
};

const LOCKOUT_SECONDS = 30;
const MAX_ATTEMPTS = 3;

const PasscodeVerificationModal: React.FC<PasscodeVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  employeeName,
  title,
  actionLabel,
  actionDescription,
  actionColor,
  actionType,
}) => {
  /* ── Türetilmiş değerler ── */
  const resolvedColor: 'green' | 'blue' | 'red' | 'indigo' =
    actionColor ??
    (actionType === 'approve' ? 'green' : actionType === 'reject' ? 'red' : 'indigo');
  const resolvedLabel =
    actionLabel ??
    (actionType === 'approve' ? 'Bordroyu Onayla' : actionType === 'reject' ? 'Bordroyu Reddet' : 'Onayla');
  const resolvedTitle = title ?? 'Güvenli Belge Onayı';
  const C = COLOR_MAP[resolvedColor];

  /* ── State ── */
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ── Kilitleme geri sayımı ── */
  useEffect(() => {
    if (!lockoutUntil) return;
    const id = setInterval(() => {
      const left = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (left <= 0) { setLockoutUntil(null); setRemaining(0); clearInterval(id); }
      else setRemaining(left);
    }, 500);
    return () => clearInterval(id);
  }, [lockoutUntil]);

  /* ── Sıfırla ── */
  useEffect(() => {
    if (!isOpen) return;
    setPasscode(''); setPassError('');
    setAttempts(0); setLockoutUntil(null); setRemaining(0);
    setLoading(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil;

  /* ── Onay (onVerify çağrısı) ── */
  const handleConfirm = async () => {
    if (isLockedOut) return;
    if (!passcode.trim()) { setPassError('Lütfen onay şifrenizi girin.'); return; }
    
    setLoading(true);
    setPassError('');
    try {
      const ok = await onVerify(passcode);
      if (ok) {
        onClose();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          setLockoutUntil(Date.now() + LOCKOUT_SECONDS * 1000);
          setRemaining(LOCKOUT_SECONDS);
          setPasscode('');
          setPassError(`${MAX_ATTEMPTS} başarısız deneme. ${LOCKOUT_SECONDS} saniye beklemeniz gerekiyor.`);
        } else {
          setPasscode('');
          setPassError(`Geçersiz şifre. (${newAttempts}/${MAX_ATTEMPTS} deneme)`);
        }
      }
    } catch (err) {
      setPassError(err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">

        {/* ── Başlık ── */}
        <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 ${C.bg}`}>
          <div className="flex items-center gap-3">
            <Shield className={`w-6 h-6 ${C.icon}`} />
            <div>
              <h2 className={`text-lg font-bold ${C.text}`}>{resolvedTitle}</h2>
              <p className="text-xs text-gray-500">{employeeName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── İçerik ── */}
        <div className="px-6 py-5 space-y-4">
          <div className={`rounded-xl p-4 ${C.bg} border ${C.border}`}>
            <p className={`text-sm ${C.text}`}>
              <strong>{employeeName}</strong> için <strong>{resolvedLabel}</strong> işlemi gerçekleştirilecektir.
            </p>
            {actionDescription && (
              <p className="text-xs text-gray-600 mt-1">{actionDescription}</p>
            )}
            <p className="text-xs text-gray-500 mt-1.5">Onay şifrenizi girerek işlemi tamamlayabilirsiniz.</p>
          </div>

          {isLockedOut ? (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">Çok fazla hatalı deneme. <strong>{remaining} saniye</strong> sonra tekrar deneyin.</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Onay Şifresi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => { setPasscode(e.target.value); setPassError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                  placeholder="Şifrenizi girin"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  autoFocus
                />
              </div>
              {passError && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {passError}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium">İptal</button>
            <button
              onClick={handleConfirm}
              disabled={isLockedOut || !passcode.trim() || loading}
              className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 ${C.btn}`}
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  İşleniyor...
                </>
              ) : resolvedLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasscodeVerificationModal;
