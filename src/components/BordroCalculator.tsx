import React, { useState, useEffect } from 'react';
import { Calculator, Save, FileText, Download, User, DollarSign, CheckCircle, Send } from 'lucide-react';
import { BordroItem } from '../types/bordro';
import { calculateBordro, formatCurrency, formatNumber } from '../utils/bordroCalculations';
import { Employee } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { bordroService } from '../services/bordroService';

interface BordroCalculatorProps {
  employees: Employee[];
  onSaveBordro: (bordro: BordroItem) => void;
  onSendForApproval?: (bordro: BordroItem) => void;
  selectedEmployee: Employee;
  period: string;
}

const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

const BordroCalculator: React.FC<BordroCalculatorProps> = ({ employees, onSaveBordro, onSendForApproval, selectedEmployee, period }) => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const effectiveCompanyId = profile?.company_id ?? DEMO_COMPANY_ID;

  const [formData, setFormData] = useState<any>({
    temelKazanc: 0,
    medeniDurum: 'bekar' as 'bekar' | 'evli',
    cocukSayisi: 0,
    sgkIsverenIndirimOrani: 0,
    yolParasi: 0,
    gidaYardimi: 0,
    cocukYardimi: 0,
    digerKazanclar: 0,
    fazlaMesai: 0,
    fazlaMesaiSaat50: 0,
    fazlaMesaiSaat100: 0,
    haftalikTatil: 0,
    genelTatil: 0,
    yillikIzinUcreti: 0,
    ikramiye: 0,
    prim: 0,
    servisUcreti: 0,
    temsilEtiket: 0,
    kidemTazminati: 0,
    ihbarTazminati: 0,
    avans: 0,
    sendikaidat: 0,
    digerKesintiler: 0,
    engelliIndirimi: 0
  });

  const [calculatedBordro, setCalculatedBordro] = useState<BordroItem | null>(null);
  const [savedBordro, setSavedBordro] = useState<BordroItem | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [oncekiAylarGVMatrahi, setOncekiAylarGVMatrahi] = useState(0);

  useEffect(() => {
    if (selectedEmployee) {
      setFormData(prev => ({
        ...prev,
        temelKazanc: selectedEmployee.salary || 0
      }));
      setSavedBordro(null);
    }
  }, [selectedEmployee, period]);

  // Ã–nceki aylarÄ±n kÃ¼mÃ¼latif GV matrahÄ±nÄ± DB'den yÃ¼kle
  useEffect(() => {
    if (!selectedEmployee?.id || !period) return;
    const [year, month] = period.split('-').map(Number);
    if (!year || !month) return;

    bordroService.getByEmployee(selectedEmployee.id).then((rows) => {
      if (!rows) return;
      // AynÄ± yÄ±ldaki, bu aydan Ã¶nceki tÃ¼m bordrolar
      const oncekiAylar = rows.filter((r: any) => {
        const [rYear, rMonth] = (r.period ?? '').split('-').map(Number);
        return rYear === year && rMonth < month;
      });
      // En gÃ¼ncel ayÄ±n kÃ¼mÃ¼latif matrahi = o aya kadar toplam
      // EÄŸer kayÄ±t varsa en bÃ¼yÃ¼k ay numarasÄ±nÄ±n kumulatif_vergi_matrahi deÄŸerini al
      if (oncekiAylar.length === 0) {
        setOncekiAylarGVMatrahi(0);
        return;
      }
      // En son Ã¶nceki ayÄ± bul
      const enSonAy = oncekiAylar.sort((a: any, b: any) => {
        const [, am] = (a.period ?? '').split('-').map(Number);
        const [, bm] = (b.period ?? '').split('-').map(Number);
        return bm - am;
      })[0];
      setOncekiAylarGVMatrahi(Number(enSonAy.kumulatif_vergi_matrahi) || 0);
    }).catch(() => setOncekiAylarGVMatrahi(0));
  }, [selectedEmployee?.id, period]);

  useEffect(() => {
    if (selectedEmployee) {
      const [, month] = period.split('-').map(Number);
      const ayNo = month || 1;

      const bordroData = calculateBordro({
        id: `${selectedEmployee.id}-${period}`,
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        period,
        sicilNo: selectedEmployee.id,
        tcNo: '***********',
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, undefined, ayNo, oncekiAylarGVMatrahi);
      setCalculatedBordro(bordroData);
    }
  }, [selectedEmployee, period, formData, oncekiAylarGVMatrahi]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value === '' ? '' : (parseFloat(value) || 0)
    }));
  };

  const handleSave = async () => {
    if (!calculatedBordro) return;
    setSaveMessage(null);
    setSaveError(null);

    try {
      const bordroInsertPayload = {
        company_id: effectiveCompanyId,
        employee_id: selectedEmployee.id,
        period: calculatedBordro.period,
        sicil_no: selectedEmployee.sicil_no || calculatedBordro.sicilNo || selectedEmployee.id,
        tc_no: selectedEmployee.tc_no || calculatedBordro.tcNo || '',
        brut_maas: calculatedBordro.temelKazanc,
        medeni_durum: calculatedBordro.medeniDurum || 'bekar',
        cocuk_sayisi: calculatedBordro.cocukSayisi || 0,
        engelli_durumu: selectedEmployee.engelli_durumu || 'yok',
        temel_kazanc: calculatedBordro.temelKazanc || 0,
        yol_parasi: calculatedBordro.yolParasi || 0,
        gida_yardimi: calculatedBordro.gidaYardimi || 0,
        cocuk_yardimi: calculatedBordro.cocukYardimi || 0,
        diger_kazanclar: calculatedBordro.digerKazanclar || 0,
        fazla_mesai: calculatedBordro.fazlaMesai || 0,
        fazla_mesai_saat_50: calculatedBordro.fazlaMesaiSaat50 || 0,
        fazla_mesai_saat_100: calculatedBordro.fazlaMesaiSaat100 || 0,
        fazla_mesai_tutar: calculatedBordro.fazlaMesaiTutar || 0,
        haftalik_tatil: calculatedBordro.haftalikTatil || 0,
        genel_tatil: calculatedBordro.genelTatil || 0,
        yillik_izin_ucreti: calculatedBordro.yillikIzinUcreti || 0,
        ikramiye: calculatedBordro.ikramiye || 0,
        prim: calculatedBordro.prim || 0,
        servis_ucreti: calculatedBordro.servisUcreti || 0,
        temsil_etiket: calculatedBordro.temsilEtiket || 0,
        gelir_vergisi: calculatedBordro.gelirVergisi || 0,
        damga_vergisi: calculatedBordro.damgaVergisi || 0,
        sgk_isci_payi: calculatedBordro.sgkIsciPayi || 0,
        issizlik_sigortasi: calculatedBordro.issizlikSigortasi || 0,
        sendika_aidat: calculatedBordro.sendikaidat || 0,
        avans: calculatedBordro.avans || 0,
        diger_kesintiler: calculatedBordro.digerKesintiler || 0,
        engelli_indirimi: calculatedBordro.engelliIndirimi || 0,
        kidem_tazminati: calculatedBordro.kidemTazminati || 0,
        ihbar_tazminati: calculatedBordro.ihbarTazminati || 0,
        toplam_kazanc: calculatedBordro.toplamKazanc || 0,
        toplam_kesinti: calculatedBordro.toplamKesinti || 0,
        net_maas: calculatedBordro.netMaas || 0,
        kumulatif_vergi_matrahi: calculatedBordro.kumulatifVergiMatrahi || 0,
        asgari_ucret_gelir_vergisi_istisnasi: calculatedBordro.asgariUcretGelirVergisiIstisnasi || 0,
        asgari_ucret_damga_vergisi_istisnasi: calculatedBordro.asgariUcretDamgaVergisiIstisnasi || 0,
        sgk_isveren_payi: calculatedBordro.sgkIsverenPayi || 0,
        issizlik_isveren_payi: calculatedBordro.issizlikIsverenPayi || 0,
        sgk_isveren_indirimi: calculatedBordro.sgkIsverenIndirimi || 0,
        sgk_isveren_indirim_orani: calculatedBordro.sgkIsverenIndirimOrani || 0,
        yillik_toplam_kazanc: calculatedBordro.toplamKazanc || 0,
        yillik_toplam_kesinti: calculatedBordro.toplamKesinti || 0,
        yillik_toplam_net: calculatedBordro.netMaas || 0,
        aciklama: '',
      };

      const saved = await bordroService.create(bordroInsertPayload);

      // UI tarafi camelCase alanlar kullandigi icin, DB'den donen snake_case
      // kaydi dogrudan state'e yazmak render hatasina neden oluyor.
      const uiBordro = {
        ...calculatedBordro,
        id: saved.id,
        company_id: effectiveCompanyId,
        employee_id: selectedEmployee.id,
      } as BordroItem;

      setSavedBordro(uiBordro);
      setSaveMessage('Bordro baÅŸarÄ±yla kaydedildi.');
      onSaveBordro(uiBordro);
    } catch (error: any) {
      console.error('Bordro kaydetme hatasÄ±:', error);

      // VeritabanÄ± hatasÄ± olsa bile kullanÄ±cÄ± akÄ±ÅŸÄ±nÄ± kesmeyelim; yerelde devam et.
      const localBordro = {
        ...calculatedBordro,
        id: calculatedBordro.id || crypto.randomUUID(),
        company_id: effectiveCompanyId,
        employee_id: selectedEmployee.id,
      } as BordroItem;

      setSavedBordro(localBordro);
      onSaveBordro(localBordro);

      const rawMessage = String(error?.message ?? '').toLowerCase();
      const isPermissionLikeError =
        rawMessage.includes('row-level security') ||
        rawMessage.includes('security policy') ||
        rawMessage.includes('permission denied') ||
        rawMessage.includes('not authorized') ||
        rawMessage.includes('rls');

      setSaveError(null);
      setSaveMessage(
        isPermissionLikeError
          ? 'Bordro veritabanÄ±na kaydedilemedi (yetki kÄ±sÄ±tÄ±). KayÄ±t yerel olarak tamamlandÄ±.'
          : 'Bordro veritabanÄ±na kaydedilemedi. KayÄ±t yerel olarak tamamlandÄ±.'
      );
    }
  };



  const exportToPDF = async () => {
    if (!calculatedBordro) return;

    const bordroId = savedBordro?.id || calculatedBordro.id;
    const approvalData = await bordroService.getApprovals(bordroId);

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bordro - ${calculatedBordro.employeeName} - ${calculatedBordro.period}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; background: white; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
          .header h1 { color: #1e40af; font-size: 28px; margin-bottom: 10px; }
          .info-section { margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .info-label { font-weight: bold; color: #374151; }
          .info-value { color: #1f2937; }
          .section-title { background: #eff6ff; padding: 10px; font-weight: bold; color: #1e40af; margin: 20px 0 10px 0; border-left: 4px solid #2563eb; }
          .total-row { background: #f3f4f6; padding: 12px; font-weight: bold; margin: 10px 0; }
          .net-salary { background: #dbeafe; padding: 15px; text-align: center; font-size: 24px; color: #1e40af; margin: 20px 0; border-radius: 8px; }
          .approval-section { margin-top: 40px; page-break-before: always; }
          .approval-item { border: 2px solid #10b981; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .signature-img { max-width: 300px; height: auto; margin: 10px 0; border: 1px solid #d1d5db; }
          .id-document-img { max-width: 400px; height: auto; margin: 10px 0; border: 1px solid #d1d5db; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BORDRO</h1>
          <p>${calculatedBordro.period}</p>
        </div>

        <div class="info-section">
          <h2 class="section-title">Personel Bilgileri</h2>
          <div class="info-row">
            <span class="info-label">Ad Soyad:</span>
            <span class="info-value">${calculatedBordro.employeeName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Sicil No:</span>
            <span class="info-value">${calculatedBordro.sicilNo}</span>
          </div>
          <div class="info-row">
            <span class="info-label">DÃ¶nem:</span>
            <span class="info-value">${calculatedBordro.period}</span>
          </div>
        </div>

        <div class="info-section">
          <h2 class="section-title">KazanÃ§lar</h2>
          <div class="info-row">
            <span class="info-label">Temel KazanÃ§:</span>
            <span class="info-value">${formatNumber(calculatedBordro.temelKazanc)} â‚º</span>
          </div>
          ${calculatedBordro.yolParasi > 0 ? `
          <div class="info-row">
            <span class="info-label">Yol ParasÄ±:</span>
            <span class="info-value">${formatNumber(calculatedBordro.yolParasi)} â‚º</span>
          </div>
          ` : ''}
          ${calculatedBordro.gidaYardimi > 0 ? `
          <div class="info-row">
            <span class="info-label">GÄ±da YardÄ±mÄ±:</span>
            <span class="info-value">${formatNumber(calculatedBordro.gidaYardimi)} â‚º</span>
          </div>
          ` : ''}
          <div class="total-row">
            <div class="info-row" style="border: none;">
              <span class="info-label">Toplam KazanÃ§:</span>
              <span class="info-value" style="color: #059669; font-size: 18px;">${formatNumber(calculatedBordro.toplamKazanc)} â‚º</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2 class="section-title">Kesintiler</h2>
          <div class="info-row">
            <span class="info-label">Gelir Vergisi:</span>
            <span class="info-value">${formatNumber(calculatedBordro.gelirVergisi)} â‚º</span>
          </div>
          <div class="info-row">
            <span class="info-label">Damga Vergisi:</span>
            <span class="info-value">${formatNumber(calculatedBordro.damgaVergisi)} â‚º</span>
          </div>
          <div class="info-row">
            <span class="info-label">SGK Ä°ÅŸÃ§i PayÄ±:</span>
            <span class="info-value">${formatNumber(calculatedBordro.sgkIsciPayi)} â‚º</span>
          </div>
          <div class="info-row">
            <span class="info-label">Ä°ÅŸsizlik SigortasÄ±:</span>
            <span class="info-value">${formatNumber(calculatedBordro.issizlikSigortasi)} â‚º</span>
          </div>
          <div class="total-row">
            <div class="info-row" style="border: none;">
              <span class="info-label">Toplam Kesinti:</span>
              <span class="info-value" style="color: #dc2626; font-size: 18px;">${formatNumber(calculatedBordro.toplamKesinti)} â‚º</span>
            </div>
          </div>
        </div>

        <div class="net-salary">
          <div>NET MAAÅž</div>
          <div style="font-size: 32px; margin-top: 10px;">${formatNumber(calculatedBordro.netMaas)} â‚º</div>
        </div>

        ${(approvalData && approvalData.length > 0) ? `
        <div class="approval-section">
          <h2 class="section-title">Onay KayÄ±tlarÄ±</h2>
          ${approvalData.map((approval: any, index: number) => `
            <div class="approval-item">
              <div class="info-row" style="border: none;">
                <span class="info-label">Ã‡alÄ±ÅŸan:</span>
                <span class="info-value">${approval.employee_name}</span>
              </div>
              <div class="info-row" style="border: none;">
                <span class="info-label">Onay Durumu:</span>
                <span class="info-value" style="color: ${approval.approval_status === 'onaylandi' ? '#059669' : '#dc2626'}">
                  ${approval.approval_status === 'onaylandi' ? 'OnaylandÄ±' : 'Reddedildi'}
                </span>
              </div>
              <div class="info-row" style="border: none;">
                <span class="info-label">Tarih:</span>
                <span class="info-value">${new Date(approval.timestamp).toLocaleString('tr-TR')}</span>
              </div>
              <div class="info-row" style="border: none;">
                <span class="info-label">DoÄŸrulama YÃ¶ntemi:</span>
                <span class="info-value">
                  ${approval.verification_method === 'signature' ? 'Dijital Ä°mza' :
                    approval.verification_method === 'id_document' ? 'Kimlik Belgesi' : 'Onay Åžifresi'}
                </span>
              </div>
              ${approval.signature_data ? `
                <div style="margin-top: 10px;">
                  <strong>Dijital Ä°mza:</strong><br>
                  <img src="${approval.signature_data}" class="signature-img" alt="Ä°mza" />
                </div>
              ` : ''}
              ${approval.id_document_data ? `
                <div style="margin-top: 10px;">
                  <strong>Kimlik Belgesi:</strong><br>
                  <img src="${approval.id_document_data}" class="id_document-img" alt="Kimlik" />
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Bu bordro ${new Date().toLocaleDateString('tr-TR')} tarihinde oluÅŸturulmuÅŸtur.</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">{t('bordro.calculator')}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!calculatedBordro}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {t('common.save')}
          </button>
          {savedBordro && onSendForApproval && (
            <button
              onClick={() => onSendForApproval(savedBordro)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Onaya GÃ¶nder
            </button>
          )}
          <button
            onClick={exportToPDF}
            disabled={!calculatedBordro}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {(saveMessage || saveError) && (
        <div className="px-6 pt-4">
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {saveMessage ?? 'Ä°ÅŸlem tamamlandÄ±. Yerel kayÄ±t modu devrede olabilir.'}
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol Panel - GiriÅŸ Formu */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Bordro Parametreleri
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.maritalStatus')}</label>
                    <select
                      value={formData.medeniDurum}
                      onChange={(e) => setFormData(prev => ({ ...prev, medeniDurum: e.target.value as 'bekar' | 'evli' }))}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="bekar">{t('bordro.single')}</option>
                      <option value="evli">{t('bordro.married')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.childrenCount')}</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.cocukSayisi}
                      onChange={(e) => setFormData(prev => ({ ...prev, cocukSayisi: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.employerSGKDiscount')}</label>
                  <select
                    value={formData.sgkIsverenIndirimOrani}
                    onChange={(e) => setFormData(prev => ({ ...prev, sgkIsverenIndirimOrani: parseInt(e.target.value) }))}
                    className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="0">{t('bordro.noDiscount')}</option>
                    <option value="5">5 {t('bordro.pointDiscount')}</option>
                    <option value="4">4 {t('bordro.pointDiscount')}</option>
                    <option value="2">2 {t('bordro.pointDiscount')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mt-6">
                <DollarSign className="w-5 h-5" />
                {t('bordro.totalEarnings')}
              </h3>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.baseSalary')}</label>
                    <input
                      type="number"
                      value={formData.temelKazanc}
                      onChange={(e) => handleInputChange('temelKazanc', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.transportAllowance')}</label>
                    <input
                      type="number"
                      value={formData.yolParasi}
                      onChange={(e) => handleInputChange('yolParasi', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.foodAllowance')}</label>
                    <input
                      type="number"
                      value={formData.gidaYardimi}
                      onChange={(e) => handleInputChange('gidaYardimi', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.childAllowance')}</label>
                    <input
                      type="number"
                      value={formData.cocukYardimi}
                      onChange={(e) => handleInputChange('cocukYardimi', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.otherEarnings')}</label>
                    <input
                      type="number"
                      value={formData.digerKazanclar}
                      onChange={(e) => handleInputChange('digerKazanclar', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      step="0.01"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6">{t('bordro.additionalPayments')}</h3>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
                  <h4 className="text-sm font-semibold text-blue-800 mb-3">{t('bordro.overtimeCalculation')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{t('bordro.overtime50')} (%50)</label>
                      <input
                        type="number"
                        value={formData.fazlaMesaiSaat50}
                        onChange={(e) => handleInputChange('fazlaMesaiSaat50', e.target.value)}
                        className="w-full bg-white border border-gray-200 text-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        step="0.5"
                        placeholder="Saat"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{t('bordro.overtime100')} (%100)</label>
                      <input
                        type="number"
                        value={formData.fazlaMesaiSaat100}
                        onChange={(e) => handleInputChange('fazlaMesaiSaat100', e.target.value)}
                        className="w-full bg-white border border-gray-200 text-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        step="0.5"
                        placeholder="Saat"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {t('bordro.overtimeInfo')}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.overtimeManual')}</label>
                    <input
                      type="number"
                      value={formData.fazlaMesai}
                      onChange={(e) => handleInputChange('fazlaMesai', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      step="0.01"
                      placeholder="Manuel tutar"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.bonus')}</label>
                    <input
                      type="number"
                      value={formData.ikramiye}
                      onChange={(e) => handleInputChange('ikramiye', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.premium')}</label>
                    <input
                      type="number"
                      value={formData.prim}
                      onChange={(e) => handleInputChange('prim', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.annualLeaveWage')}</label>
                    <input
                      type="number"
                      value={formData.yillikIzinUcreti}
                      onChange={(e) => handleInputChange('yillikIzinUcreti', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.weeklyHoliday')}</label>
                    <input
                      type="number"
                      value={formData.haftalikTatil}
                      onChange={(e) => handleInputChange('haftalikTatil', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.publicHoliday')}</label>
                    <input
                      type="number"
                      value={formData.genelTatil}
                      onChange={(e) => handleInputChange('genelTatil', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      step="0.01"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6">{t('bordro.taxDeductions')}</h3>

                <div className="grid grid-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.disabilityReduction')}</label>
                    <input
                      type="number"
                      value={formData.engelliIndirimi}
                      onChange={(e) => handleInputChange('engelliIndirimi', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      step="0.01"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6">{t('bordro.otherDeductions')}</h3>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.advance')}</label>
                    <input
                      type="number"
                      value={formData.avans}
                      onChange={(e) => handleInputChange('avans', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.unionDues')}</label>
                    <input
                      type="number"
                      value={formData.sendikaidat}
                      onChange={(e) => handleInputChange('sendikaidat', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bordro.otherDeduction')}</label>
                    <input
                      type="number"
                      value={formData.digerKesintiler}
                      onChange={(e) => handleInputChange('digerKesintiler', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>

          {/* SaÄŸ Panel - Bordro Ã–nizleme */}
          <div className="space-y-6">
            {(savedBordro || calculatedBordro) && (() => {
              const displayBordro = savedBordro || calculatedBordro!;
              return (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">{t('bordro.preview')}</h3>
                </div>

                <div className="space-y-6">
                  {/* Personel Bilgileri */}
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">{t('bordro.employeeInfo')}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">{t('bordro.fullName')}:</span>
                        <span className="text-gray-800 ml-2">{displayBordro.employeeName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('bordro.period')}:</span>
                        <span className="text-gray-800 ml-2">{displayBordro.period}</span>
                      </div>
                    </div>
                  </div>

                  {/* KazanÃ§lar */}
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">{t('bordro.earnings')}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('bordro.baseSalary')}</span>
                        <span className="text-gray-800">{formatNumber(displayBordro.temelKazanc)} â‚º</span>
                      </div>
                      {displayBordro.yolParasi > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('bordro.transportAllowance')}</span>
                          <span className="text-gray-800">{formatNumber(displayBordro.yolParasi)} â‚º</span>
                        </div>
                      )}
                      {displayBordro.gidaYardimi > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('bordro.foodAllowance')}</span>
                          <span className="text-gray-800">{formatNumber(displayBordro.gidaYardimi)} â‚º</span>
                        </div>
                      )}
                      {displayBordro.cocukYardimi > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('bordro.childAllowance')}</span>
                          <span className="text-gray-800">{formatNumber(displayBordro.cocukYardimi)} â‚º</span>
                        </div>
                      )}
                      {displayBordro.digerKazanclar > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('bordro.otherEarnings')}</span>
                          <span className="text-gray-800">{formatNumber(displayBordro.digerKazanclar)} â‚º</span>
                        </div>
                      )}
                      {(displayBordro.fazlaMesaiTutar || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('bordro.overtime')}</span>
                          <span className="text-gray-800">{formatNumber(displayBordro.fazlaMesaiTutar || 0)} â‚º</span>
                        </div>
                      )}
                      {(displayBordro.fazlaMesaiSaat50 || 0) > 0 && (
                        <div className="flex justify-between text-xs text-gray-400 pl-4">
                          <span>  â€¢ %50 Zam ({displayBordro.fazlaMesaiSaat50} saat)</span>
                          <span>{formatNumber((displayBordro.temelKazanc / 225) * 1.5 * (displayBordro.fazlaMesaiSaat50 || 0))} â‚º</span>
                        </div>
                      )}
                      {(displayBordro.fazlaMesaiSaat100 || 0) > 0 && (
                        <div className="flex justify-between text-xs text-gray-400 pl-4">
                          <span>  â€¢ %100 Zam ({displayBordro.fazlaMesaiSaat100} saat)</span>
                          <span>{formatNumber((displayBordro.temelKazanc / 225) * 2 * (displayBordro.fazlaMesaiSaat100 || 0))} â‚º</span>
                        </div>
                      )}
                      {(displayBordro.ikramiye || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('bordro.bonus')}</span>
                          <span className="text-gray-800">{formatNumber(displayBordro.ikramiye || 0)} â‚º</span>
                        </div>
                      )}
                      {(displayBordro.prim || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('bordro.premium')}</span>
                          <span className="text-gray-800">{formatNumber(displayBordro.prim || 0)} â‚º</span>
                        </div>
                      )}
                      {(displayBordro.yillikIzinUcreti || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('bordro.annualLeaveWage')}</span>
                          <span className="text-gray-800">{formatNumber(displayBordro.yillikIzinUcreti || 0)} â‚º</span>
                        </div>
                      )}
                      {(displayBordro.haftalikTatil || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('bordro.weeklyHoliday')}</span>
                          <span className="text-gray-800">{formatNumber(displayBordro.haftalikTatil || 0)} â‚º</span>
                        </div>
                      )}
                      {(displayBordro.genelTatil || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('bordro.publicHoliday')}</span>
                          <span className="text-gray-800">{formatNumber(displayBordro.genelTatil || 0)} â‚º</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
                        <span className="text-green-600">{t('bordro.totalEarnings')}</span>
                        <span className="text-green-600">{formatNumber(displayBordro.toplamKazanc)} â‚º</span>
                      </div>
                    </div>
                  </div>

                  {/* Kesintiler */}
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">{t('bordro.deductions')}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('bordro.incomeTax')}</span>
                        <span className="text-gray-800">{formatNumber(displayBordro.gelirVergisi)} â‚º</span>
                      </div>
                      {(displayBordro.engelliIndirimi || 0) > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>{t('bordro.disabilityReduction')}</span>
                          <span>-{formatNumber(displayBordro.engelliIndirimi || 0)} â‚º</span>
                        </div>
                      )}
                      {(displayBordro.asgariUcretGelirVergisiIstisnasi || 0) > 0 && (
                        <div className="flex justify-between text-green-600 border-t border-green-200 pt-1 mt-1">
                          <span className="text-xs">{t('bordro.minWageIncomeTaxExemption')}</span>
                          <span className="text-xs">-{formatNumber(displayBordro.asgariUcretGelirVergisiIstisnasi || 0)} â‚º</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('bordro.stampTax')}</span>
                        <span className="text-gray-800">{formatNumber(displayBordro.damgaVergisi)} â‚º</span>
                      </div>
                      {(displayBordro.asgariUcretDamgaVergisiIstisnasi || 0) > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span className="text-xs">{t('bordro.minWageStampTaxExemption')}</span>
                          <span className="text-xs">-{formatNumber(displayBordro.asgariUcretDamgaVergisiIstisnasi || 0)} â‚º</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('bordro.sgkEmployee')}</span>
                        <span className="text-gray-800">{formatNumber(displayBordro.sgkIsciPayi)} â‚º</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('bordro.unemploymentInsurance')}</span>
                        <span className="text-gray-800">{formatNumber(displayBordro.issizlikSigortasi)} â‚º</span>
                      </div>
                      {displayBordro.avans > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('bordro.advance')}</span>
                          <span className="text-gray-800">{formatNumber(displayBordro.avans)} â‚º</span>
                        </div>
                      )}
                      {displayBordro.sendikaidat > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('bordro.unionDues')}</span>
                          <span className="text-gray-800">{formatNumber(displayBordro.sendikaidat)} â‚º</span>
                        </div>
                      )}
                      {displayBordro.digerKesintiler > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('bordro.otherDeduction')}</span>
                          <span className="text-gray-800">{formatNumber(displayBordro.digerKesintiler)} â‚º</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
                        <span className="text-red-600">{t('bordro.totalDeduction')}</span>
                        <span className="text-red-600">{formatNumber(displayBordro.toplamKesinti)} â‚º</span>
                      </div>
                    </div>
                  </div>

                  {/* Net MaaÅŸ */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-700">{t('bordro.netSalary').toUpperCase()}</span>
                      <span className="text-2xl font-bold text-blue-700">
                        {formatNumber(displayBordro.netMaas)} â‚º
                      </span>
                    </div>
                  </div>

                  {/* Ä°ÅŸveren PaylarÄ± */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">{t('bordro.employerShares')}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('bordro.sgkEmployer')}</span>
                        <span className="text-gray-800">{formatNumber(displayBordro.sgkIsverenPayi)} â‚º</span>
                      </div>
                      {(displayBordro.sgkIsverenIndirimi || 0) > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span className="text-xs">{t('bordro.sgkEmployerDiscount')} ({displayBordro.sgkIsverenIndirimOrani}%)</span>
                          <span className="text-xs">-{formatNumber(displayBordro.sgkIsverenIndirimi || 0)} â‚º</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('bordro.unemploymentEmployer')}</span>
                        <span className="text-gray-800">{formatNumber(displayBordro.issizlikIsverenPayi)} â‚º</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BordroCalculator;
