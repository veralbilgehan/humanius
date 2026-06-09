import React, { useState } from 'react';
import { Shield, User, AlertTriangle, Lock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Employee } from '../types';
import PasscodeVerificationModal from './PasscodeVerificationModal';
import bcrypt from 'bcryptjs';

interface GlobalEmployeeHeaderProps {
  employee: Employee;
  isAccessGranted: boolean;
  onAccessGranted: () => void;
}

export const GlobalEmployeeHeader: React.FC<GlobalEmployeeHeaderProps> = ({
  employee,
  isAccessGranted,
  onAccessGranted
}) => {
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleAccessVerify = async (passcode: string): Promise<boolean> => {
    const stored = employee.approval_passcode;
    if (!stored) { onAccessGranted(); return true; }
    
    let isValid = false;
    try {
      isValid = bcrypt.compareSync(passcode, stored);
    } catch (e) {
      isValid = false;
    }
    
    if (!isValid && stored === passcode) {
      isValid = true;
    }

    if (!isValid) return false;
    onAccessGranted();
    return true;
  };

  if (isMinimized) {
    return (
      <div className="mb-6 animate-fade-in bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="font-bold text-blue-900 text-base">İşlem Yapılan Kişi: {employee.name.toLocaleUpperCase('tr-TR')}</span>
          <span className="text-blue-700 flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            Devam eden işlemler var.
          </span>
        </div>
        <button 
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold text-sm transition-colors"
        >
          Personel Kartını Aç <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 animate-fade-in flex flex-col xl:flex-row gap-6">
      {/* SOL: HIZLI İŞLEM BARI */}
      <div className="flex flex-row xl:flex-col gap-3 min-w-[200px]">
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-sm transition-colors w-full text-center">Çok Kullanılanlar</button>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-sm transition-colors w-full text-center">Sık Kullanılanlar</button>
        <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-sm transition-colors w-full text-center">Son</button>
      </div>

      {/* SAĞ: KART */}
      <div className="flex-1 flex flex-col gap-4">
        {/* İŞLEM DURUM BARI */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="font-bold text-blue-900 text-base">İşlem Yapılan Kişi: {employee.name.toLocaleUpperCase('tr-TR')}</span>
            <span className="text-blue-700 flex items-center gap-2 text-sm font-medium hidden sm:flex">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              Bu kişinin işlemleri devam etmektedir.
            </span>
          </div>
          <button 
            onClick={() => setIsMinimized(true)}
            className="flex items-center gap-2 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold text-sm transition-colors shrink-0"
          >
            Kartı Küçült <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        {/* İKİLİ PANO (GENEL BİLGİLER & QR) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* SOL PANEL: PERSONEL GENEL BİLGİLERİ */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> PERSONEL GENEL BİLGİLERİ
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Adı Soyadı:</span>
                <span className="font-semibold text-gray-900">{employee.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Departman:</span>
                <span className="font-semibold text-gray-900">{employee.department || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Şirket:</span>
                <span className="font-semibold text-gray-900">{employee.company_id ? 'Humanius (Demo)' : '-'}</span>
              </div>
            </div>
          </div>

          {/* SAĞ PANEL: GÜVENLİ ERİŞİM (QR) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-gray-500 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" /> GÜVENLİ ERİŞİM (QR)
            </h3>
            <div className="flex-1 flex items-center justify-center gap-8">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <QRCodeSVG 
                  value={`https://humanius.net/evrak-kontrol?token=encrypted_${employee.id}`} 
                  size={120} 
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="flex flex-col items-start gap-4">
                {isAccessGranted ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 font-bold w-full">
                    <CheckCircle className="w-5 h-5" />
                    Erişim Açık
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => setShowAccessModal(true)}
                      className="bg-gray-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-700 transition-colors w-full justify-center shadow-md"
                    >
                      <Lock className="w-5 h-5" />
                      Bordro & Talepler
                    </button>
                    <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                      <AlertTriangle className="w-4 h-4" /> 
                      Okutulduğunda şifre ister.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* İŞLEM YOLLARI (ALT BUTONLAR) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-4 rounded-xl font-bold hover:bg-blue-100 transition-colors text-center text-sm md:text-base">
            Yol A: Değişiklik Yap (İlk Seç)
          </button>
          <button className="bg-gray-50 text-gray-700 border border-gray-200 px-4 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors text-center text-sm md:text-base">
            Yol B: Evrak Üzerinden Yürü (7 Kişi)
          </button>
        </div>

      </div>

      {showAccessModal && (
        <PasscodeVerificationModal
          isOpen={showAccessModal}
          onClose={() => setShowAccessModal(false)}
          onVerify={handleAccessVerify}
          employeeName={employee.name}
          title="Güvenli Belge Onayı"
          actionLabel="Dosyaya Eriş"
          actionDescription="Özlük dosyasına erişmek için kimliğinizi doğrulayın."
          actionColor="blue"
          tcNo={employee.tc_no ?? undefined}
        />
      )}
    </div>
  );
};
