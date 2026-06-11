import re

with open('src/components/PDKSYonetimi.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
import_replacement = """import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pdksService } from '../services/pdksService';
import { Loader2 } from 'lucide-react';
"""
content = re.sub(r"import React, \{ useMemo, useState \} from 'react';", import_replacement, content)

# 2. Add loading state and role check, change allKayitlar to empty array
state_setup_old = """const PDKSYonetimi: React.FC<PDKSYonetimiProps> = ({
  employees,
  izinTalepleri = [],
}) => {
  const [aktifSekme, setAktifSekme] = useState<Sekme>('devam');"""

state_setup_new = """const PDKSYonetimi: React.FC<PDKSYonetimiProps> = ({
  employees,
  izinTalepleri = [],
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'hr' || user?.role === 'manager';
  
  const [loading, setLoading] = useState(true);
  const [aktifSekme, setAktifSekme] = useState<Sekme>('devam');"""
content = content.replace(state_setup_old, state_setup_new)

allkayitlar_old = """const [allKayitlar, setAllKayitlar] = useState<PDKSKaydi[]>(() => generateDemoKayitlar(employees));"""
allkayitlar_new = """const [allKayitlar, setAllKayitlar] = useState<PDKSKaydi[]>([]);

  const loadData = async () => {
    if (!employees.length || !user) return;
    try {
      setLoading(true);
      const vardiyalarDb = await pdksService.getVardiyalar();
      const mesailerDb = await pdksService.getFazlaMesailer();
      
      const mapped: PDKSKaydi[] = vardiyalarDb.map(v => {
        const emp = employees.find(e => e.id === v.employee_id);
        const vardiyaTanimi = DEMO_VARDIYALAR[0];
        
        let girisSaati = v.giris_saati ? v.giris_saati.substring(0, 5) : null;
        let cikisSaati = v.cikis_saati ? v.cikis_saati.substring(0, 5) : null;
        
        const hesap = hesaplaKayit(girisSaati, cikisSaati, vardiyaTanimi);
        const mesai = mesailerDb.find(m => m.employee_id === v.employee_id && m.tarih === v.tarih);
        
        let durum = v.durum as PDKSDurum;
        if (durum === 'zamaninda') durum = 'normal';
        if (durum === 'gec-kaldi') durum = 'gec';
        if (durum === 'erken-cikti') durum = 'erken-cikis';
        
        return {
          id: v.id,
          employeeId: v.employee_id,
          employeeName: emp?.name || 'Bilinmeyen',
          department: emp?.department || '-',
          tarih: v.tarih,
          girisZamani: girisSaati,
          cikisZamani: cikisSaati,
          kaynakTip: 'mobil-qr',
          brutCalismaDk: hesap.brutCalismaDk,
          molaDusumuDk: hesap.molaDusumuDk,
          netCalismaDk: hesap.netCalismaDk,
          gecikmeVar: hesap.gecikmeVar,
          gecikmeDk: hesap.gecikmeDk,
          toleransUygulandi: hesap.toleransUygulandi,
          gunlukFazlaMesaiDk: mesai ? Math.round(mesai.toplam_saat * 60) : hesap.gunlukFazlaMesaiDk,
          durum: durum,
          notlar: v.notlar || '',
          fazlaMesaiOnayDurum: (mesai?.onay_durumu || 'beklemede') as OnayDurum,
          duzeltmeTalebi: cikisSaati === null && girisSaati !== null
        };
      });
      setAllKayitlar(mapped);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [employees, user]);
"""
content = content.replace(allkayitlar_old, allkayitlar_new)


# 3. Fazla Mesai Onayla logic
fm_old = """function fazlaMesaiOnayla(employeeId: string, durum: OnayDurum) {
    setAllKayitlar((prev) => prev.map((k) => (k.employeeId === employeeId ? { ...k, fazlaMesaiOnayDurum: durum } : k)));
  }"""
fm_new = """async function fazlaMesaiOnayla(employeeId: string, durum: OnayDurum) {
    if (!user) return;
    try {
      const mesailerDb = await pdksService.getFazlaMesailer();
      const mesai = mesailerDb.find(m => m.employee_id === employeeId);
      if (mesai) {
         await pdksService.approveFazlaMesai(mesai.id, user.id, durum === 'onaylandi');
         await loadData();
      }
    } catch (error) {
      console.error(error);
      alert('Hata olustu');
    }
  }"""
content = content.replace(fm_old, fm_new)

# 4. Duzeltme Kaydet logic
duzelt_old = """function duzeltmeKaydet() {
    if (!duzeltmeModal || !duzeltmeSaati) return;
    const hesap = hesaplaKayit(duzeltmeModal.girisZamani, duzeltmeSaati, DEMO_VARDIYALAR[0]);
    setAllKayitlar((prev) =>
      prev.map((k) =>
        k.id === duzeltmeModal.id
          ? {
              ...k,
              cikisZamani: duzeltmeSaati,
              duzeltmeTalebi: false,
              ...hesap,
            }
          : k
      )
    );
    setDuzeltmeModal(null);
    setDuzeltmeSaati('');
  }"""
duzelt_new = """async function duzeltmeKaydet() {
    if (!duzeltmeModal || !duzeltmeSaati) return;
    try {
      await pdksService.updateVardiya(duzeltmeModal.id, { cikis_saati: duzeltmeSaati + ':00' });
      const hesap = hesaplaKayit(duzeltmeModal.girisZamani, duzeltmeSaati, DEMO_VARDIYALAR[0]);
      if (hesap.gunlukFazlaMesaiDk > 0) {
         await pdksService.createFazlaMesai({
           company_id: user?.user_metadata?.company_id,
           employee_id: duzeltmeModal.employeeId,
           tarih: duzeltmeModal.tarih,
           baslangic_saati: DEMO_VARDIYALAR[0].cikis + ':00',
           bitis_saati: duzeltmeSaati + ':00',
           toplam_saat: hesap.gunlukFazlaMesaiDk / 60,
           aciklama: 'Otomatik duzeltme',
           onay_durumu: 'bekliyor',
           onaylayan_id: null,
           onay_tarihi: null
         });
      }
      await loadData();
    } catch(err) {
      console.error(err);
    }
    setDuzeltmeModal(null);
    setDuzeltmeSaati('');
  }"""
content = content.replace(duzelt_old, duzelt_new)

# 5. Check in / Giriş Kaydet logic
checkin_old = """<button onClick={() => setCheckInModal(false)} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                Kaydet
              </button>"""
checkin_new = """<button onClick={async () => {
                if(!user) return;
                const suan = new Date();
                const tarih = suan.toISOString().split('T')[0];
                const saat = suan.toTimeString().split(' ')[0];
                try {
                   await pdksService.createVardiya({
                     company_id: user.user_metadata.company_id,
                     employee_id: user.id, // Veya seçilen kisi
                     tarih: tarih,
                     vardiya_tipi: 'sabah',
                     giris_saati: saat,
                     cikis_saati: null,
                     durum: 'zamaninda',
                     notlar: 'Manuel giris'
                   });
                   await loadData();
                } catch(e) {
                   console.log(e);
                   // If already checked in today, update it
                   const existing = allKayitlar.find(k => k.employeeId === user.id && k.tarih === tarih);
                   if (existing) {
                      await pdksService.updateVardiya(existing.id, { cikis_saati: saat });
                      await loadData();
                   }
                }
                setCheckInModal(false);
              }} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                Kaydet (Giris/Cikis)
              </button>"""
content = content.replace(checkin_old, checkin_new)


# 6. Role protection on Tabs
tabs_old = """{[
          { id: 'devam' as Sekme, label: 'Devam Takibi' },
          { id: 'motor' as Sekme, label: 'Hesaplama Motoru' },
          { id: 'onay' as Sekme, label: `Fazla Mesai Onay${bekleyenOnaySayisi ? ` (${bekleyenOnaySayisi})` : ''}` },
          { id: 'vardiya' as Sekme, label: 'Vardiya Yonetimi' },
        ].map((sekme) => ("""
tabs_new = """{[
          { id: 'devam' as Sekme, label: 'Devam Takibi' },
          { id: 'motor' as Sekme, label: 'Hesaplama Motoru' },
          (isAdmin ? { id: 'onay' as Sekme, label: `Fazla Mesai Onay${bekleyenOnaySayisi ? ` (${bekleyenOnaySayisi})` : ''}` } : null),
          (isAdmin ? { id: 'vardiya' as Sekme, label: 'Vardiya Yonetimi' } : null),
        ].filter(Boolean).map((sekme: any) => ("""
content = content.replace(tabs_old, tabs_new)

# Add loading spinner
return_start = """return (
    <div className="space-y-5">"""
return_new = """if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-5">"""
content = content.replace(return_start, return_new)


with open('src/components/PDKSYonetimi.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("PDKSYonetimi.tsx refactored successfully.")
