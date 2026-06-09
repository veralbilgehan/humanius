import { supabase } from '../lib/supabase';

export type VardiyaTipi = 'sabah' | 'aksam' | 'gece' | 'tam-gun' | 'yari-gun';
export type GirisDurumu = 'zamaninda' | 'gec-kaldi' | 'erken-cikti' | 'gelmedi' | 'izinli';
export type MesaiDurumu = 'bekliyor' | 'onaylandi' | 'reddedildi';

export interface VardiyaKaydi {
  id: string;
  company_id: string;
  employee_id: string;
  tarih: string;
  vardiya_tipi: VardiyaTipi;
  giris_saati: string | null;
  cikis_saati: string | null;
  durum: GirisDurumu;
  notlar: string | null;
  created_at: string;
  updated_at: string;
}

export interface FazlaMesai {
  id: string;
  company_id: string;
  employee_id: string;
  tarih: string;
  baslangic_saati: string;
  bitis_saati: string;
  toplam_saat: number;
  aciklama: string | null;
  onay_durumu: MesaiDurumu;
  onaylayan_id: string | null;
  onay_tarihi: string | null;
  created_at: string;
  updated_at: string;
}

export type VardiyaInsert = Omit<VardiyaKaydi, 'id' | 'created_at' | 'updated_at'>;
export type FazlaMesaiInsert = Omit<FazlaMesai, 'id' | 'created_at' | 'updated_at'>;

export const pdksService = {
  // =====================================
  // VARDIYA İŞLEMLERİ
  // =====================================
  async getVardiyalar(): Promise<VardiyaKaydi[]> {
    const { data, error } = await supabase
      .from('pdks_vardiya_kayitlari')
      .select('*')
      .order('tarih', { ascending: false });

    if (error) throw error;
    return data as VardiyaKaydi[];
  },

  async createVardiya(kayit: VardiyaInsert): Promise<VardiyaKaydi> {
    const { data, error } = await supabase
      .from('pdks_vardiya_kayitlari')
      .insert(kayit)
      .select()
      .single();

    if (error) throw error;
    return data as VardiyaKaydi[];
  },

  async updateVardiya(id: string, updates: Partial<VardiyaInsert>): Promise<VardiyaKaydi> {
    const { data, error } = await supabase
      .from('pdks_vardiya_kayitlari')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as VardiyaKaydi;
  },

  async deleteVardiya(id: string): Promise<void> {
    const { error } = await supabase
      .from('pdks_vardiya_kayitlari')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // =====================================
  // FAZLA MESAİ İŞLEMLERİ
  // =====================================
  async getFazlaMesailer(): Promise<FazlaMesai[]> {
    const { data, error } = await supabase
      .from('pdks_fazla_mesai')
      .select('*')
      .order('tarih', { ascending: false });

    if (error) throw error;
    return data as FazlaMesai[];
  },

  async createFazlaMesai(kayit: FazlaMesaiInsert): Promise<FazlaMesai> {
    const { data, error } = await supabase
      .from('pdks_fazla_mesai')
      .insert(kayit)
      .select()
      .single();

    if (error) throw error;
    return data as FazlaMesai;
  },

  async updateFazlaMesai(id: string, updates: Partial<FazlaMesaiInsert>): Promise<FazlaMesai> {
    const { data, error } = await supabase
      .from('pdks_fazla_mesai')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FazlaMesai;
  },

  async deleteFazlaMesai(id: string): Promise<void> {
    const { error } = await supabase
      .from('pdks_fazla_mesai')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async approveFazlaMesai(id: string, onaylayanId: string, isApproved: boolean): Promise<FazlaMesai> {
    const { data, error } = await supabase
      .from('pdks_fazla_mesai')
      .update({
        onay_durumu: isApproved ? 'onaylandi' : 'reddedildi',
        onaylayan_id: onaylayanId,
        onay_tarihi: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FazlaMesai;
  }
};
