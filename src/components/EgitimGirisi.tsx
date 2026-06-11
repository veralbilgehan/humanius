import React, { useState } from 'react';
import { BookOpen, Send, CheckCircle, Shield } from 'lucide-react';

const EgitimGirisi: React.FC = () => {
  const [egitimTuru, setEgitimTuru] = useState('standart');
  const [kvkkOnay, setKvkkOnay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');

    // Simulate API call and email sending
    setTimeout(() => {
      setIsSubmitting(false);
      if (egitimTuru === 'kvkk') {
        setSuccessMsg('Eğitim başarıyla kaydedildi! personelim@sirket.com.tr adresine KVKK Eğitim Sertifikası e-postası gönderildi.');
      } else {
        setSuccessMsg('Eğitim kaydı başarıyla oluşturuldu.');
      }
      setKvkkOnay(false);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Eğitim Girişi</h2>
        <p className="text-sm text-gray-500 mt-1">
          Personel eğitim kayıtlarını oluşturun. KVKK eğitimlerinde otomatik e-posta gönderimi tetiklenir.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Eğitim Türü</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`cursor-pointer rounded-xl border-2 p-4 flex items-center gap-3 transition-all ${
                egitimTuru === 'standart' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}>
                <input
                  type="radio"
                  name="egitimTuru"
                  value="standart"
                  checked={egitimTuru === 'standart'}
                  onChange={(e) => setEgitimTuru(e.target.value)}
                  className="sr-only"
                />
                <BookOpen className={`w-6 h-6 ${egitimTuru === 'standart' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div>
                  <h4 className={`font-bold ${egitimTuru === 'standart' ? 'text-blue-800' : 'text-gray-700'}`}>Standart Eğitim</h4>
                  <p className="text-xs text-gray-500">Mesleki gelişim, oryantasyon vb.</p>
                </div>
              </label>

              <label className={`cursor-pointer rounded-xl border-2 p-4 flex items-center gap-3 transition-all ${
                egitimTuru === 'kvkk' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
              }`}>
                <input
                  type="radio"
                  name="egitimTuru"
                  value="kvkk"
                  checked={egitimTuru === 'kvkk'}
                  onChange={(e) => setEgitimTuru(e.target.value)}
                  className="sr-only"
                />
                <Shield className={`w-6 h-6 ${egitimTuru === 'kvkk' ? 'text-purple-600' : 'text-gray-400'}`} />
                <div>
                  <h4 className={`font-bold ${egitimTuru === 'kvkk' ? 'text-purple-800' : 'text-gray-700'}`}>KVKK / GDPR Eğitimi</h4>
                  <p className="text-xs text-gray-500">Tamamlandığında e-posta tetikler.</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Eğitim Adı</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="Örn: 2026 Yılı Zorunlu KVKK Eğitimi"
              defaultValue={egitimTuru === 'kvkk' ? 'KVKK Farkındalık Eğitimi' : ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Eğitmen / Kurum</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="Eğitmen Adı"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tamamlanma Tarihi</label>
              <input 
                type="date" 
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          {egitimTuru === 'kvkk' && (
            <div className="bg-purple-100 border border-purple-200 p-4 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  required
                  checked={kvkkOnay}
                  onChange={(e) => setKvkkOnay(e.target.checked)}
                  className="mt-1 w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <div className="text-sm">
                  <span className="font-bold text-purple-900 block">Sertifika ve Bilgilendirme Onayı</span>
                  <span className="text-purple-700 block mt-1">
                    Bu eğitim kaydedildiğinde personele kurum e-posta adresi (com.tr) üzerinden KVKK Aydınlatma Metni ve Eğitim Sertifikası otomatik olarak gönderilecektir. Onaylıyor musunuz?
                  </span>
                </div>
              </label>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Eğitimi Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {successMsg && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl flex items-start gap-3 animate-fade-in">
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-green-800">Başarılı</h3>
            <p className="text-green-700 mt-1">{successMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EgitimGirisi;
