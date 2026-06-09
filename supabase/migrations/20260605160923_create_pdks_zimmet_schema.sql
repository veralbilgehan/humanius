-- ==========================================
-- ZİMMET YÖNETİMİ ŞEMASI
-- ==========================================

-- zimmet_kategori ve zimmet_durum enum tipleri
CREATE TYPE zimmet_kategori AS ENUM ('bilgisayar', 'telefon', 'arac', 'anahtar', 'monitor', 'yazici', 'diger');
CREATE TYPE zimmet_durum AS ENUM ('aktif', 'iade-edildi', 'kayip', 'bakimda');

-- zimmetler tablosu
CREATE TABLE IF NOT EXISTS public.zimmetler (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    seri_no TEXT NOT NULL,
    ad TEXT NOT NULL,
    kategori zimmet_kategori NOT NULL DEFAULT 'bilgisayar',
    marka TEXT,
    model TEXT,
    deger NUMERIC(10, 2) DEFAULT 0,
    durum zimmet_durum NOT NULL DEFAULT 'aktif',
    atanan_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    atanma_tarihi DATE,
    iade_tarihi DATE,
    aciklama TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS (Row Level Security) - Zimmetler
ALTER TABLE public.zimmetler ENABLE ROW LEVEL SECURITY;

-- Politikalar: 
-- 1. Admin/HR/Manager: Kendi şirketlerindeki tüm zimmetleri görebilir, ekleyebilir, güncelleyebilir, silebilir.
-- 2. User (Personel): Sadece kendi şirketindeki ve KENDİSİNE ATANMIŞ zimmetleri görebilir. (Read-only)

CREATE POLICY "Admin, HR and Manager can manage zimmetler"
ON public.zimmetler
FOR ALL
USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'admin', 'hr', 'manager')
);

CREATE POLICY "Users can view their own zimmetler"
ON public.zimmetler
FOR SELECT
USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    atanan_employee_id = auth.uid()
);

-- ==========================================
-- PDKS YÖNETİMİ ŞEMASI (Vardiya ve Mesai)
-- ==========================================

CREATE TYPE pdks_vardiya_tipi AS ENUM ('sabah', 'aksam', 'gece', 'tam-gun', 'yari-gun');
CREATE TYPE pdks_giris_durumu AS ENUM ('zamaninda', 'gec-kaldi', 'erken-cikti', 'gelmedi', 'izinli');
CREATE TYPE pdks_mesai_durumu AS ENUM ('bekliyor', 'onaylandi', 'reddedildi');

-- pdks_vardiya_kayitlari tablosu
CREATE TABLE IF NOT EXISTS public.pdks_vardiya_kayitlari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    tarih DATE NOT NULL,
    vardiya_tipi pdks_vardiya_tipi NOT NULL DEFAULT 'sabah',
    giris_saati TIME,
    cikis_saati TIME,
    durum pdks_giris_durumu NOT NULL DEFAULT 'zamaninda',
    notlar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(employee_id, tarih)
);

-- pdks_fazla_mesai tablosu
CREATE TABLE IF NOT EXISTS public.pdks_fazla_mesai (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    tarih DATE NOT NULL,
    baslangic_saati TIME NOT NULL,
    bitis_saati TIME NOT NULL,
    toplam_saat NUMERIC(4, 2) NOT NULL,
    aciklama TEXT,
    onay_durumu pdks_mesai_durumu NOT NULL DEFAULT 'bekliyor',
    onaylayan_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    onay_tarihi TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS (Row Level Security) - PDKS
ALTER TABLE public.pdks_vardiya_kayitlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdks_fazla_mesai ENABLE ROW LEVEL SECURITY;

-- Vardiya Politikaları
CREATE POLICY "Admin, HR and Manager can manage vardiya"
ON public.pdks_vardiya_kayitlari
FOR ALL
USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'admin', 'hr', 'manager')
);

CREATE POLICY "Users can view their own vardiya"
ON public.pdks_vardiya_kayitlari
FOR SELECT
USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    employee_id = auth.uid()
);

-- Mesai Politikaları
CREATE POLICY "Admin, HR and Manager can manage mesai"
ON public.pdks_fazla_mesai
FOR ALL
USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'admin', 'hr', 'manager')
);

CREATE POLICY "Users can view and request their own mesai"
ON public.pdks_fazla_mesai
FOR SELECT
USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    employee_id = auth.uid()
);

CREATE POLICY "Users can insert their own mesai request"
ON public.pdks_fazla_mesai
FOR INSERT
WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    employee_id = auth.uid()
);

-- Kullanıcı sadece "bekliyor" statüsündeki kendi mesaisini silebilir/düzenleyebilir.
CREATE POLICY "Users can update their pending mesai"
ON public.pdks_fazla_mesai
FOR UPDATE
USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    employee_id = auth.uid() AND
    onay_durumu = 'bekliyor'
);

CREATE POLICY "Users can delete their pending mesai"
ON public.pdks_fazla_mesai
FOR DELETE
USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    employee_id = auth.uid() AND
    onay_durumu = 'bekliyor'
);

-- Type tanımlamalarının veritabanına uygulanması (Eğer yoksa)
-- İşlemi güvenli hale getirmek için.
