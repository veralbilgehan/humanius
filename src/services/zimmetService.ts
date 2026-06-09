import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type ZimmetKategori = 'bilgisayar' | 'telefon' | 'arac' | 'anahtar' | 'monitor' | 'yazici' | 'diger';
export type ZimmetDurum = 'aktif' | 'iade-edildi' | 'kayip' | 'bakimda';

export interface Zimmet {
  id: string;
  company_id: string;
  seri_no: string;
  ad: string;
  kategori: ZimmetKategori;
  marka: string | null;
  model: string | null;
  deger: number;
  durum: ZimmetDurum;
  atanan_employee_id: string | null;
  atanma_tarihi: string | null;
  iade_tarihi: string | null;
  aciklama: string | null;
  created_at: string;
  updated_at: string;
}

export type ZimmetInsert = Omit<Zimmet, 'id' | 'created_at' | 'updated_at'>;

export const zimmetService = {
  /**
   * Kullanıcının yetkisi dahilindeki zimmetleri getirir
   * (Yöneticiyse şirketteki tümünü, personelse sadece kendisine atananları).
   */
  async getAll(): Promise<Zimmet[]> {
    const { data, error } = await supabase
      .from('zimmetler')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Zimmet[];
  },

  /**
   * Yeni zimmet ekler.
   */
  async create(zimmet: ZimmetInsert): Promise<Zimmet> {
    const { data, error } = await supabase
      .from('zimmetler')
      .insert(zimmet)
      .select()
      .single();

    if (error) throw error;
    return data as Zimmet;
  },

  /**
   * Mevcut bir zimmeti günceller.
   */
  async update(id: string, updates: Partial<ZimmetInsert>): Promise<Zimmet> {
    const { data, error } = await supabase
      .from('zimmetler')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Zimmet;
  },

  /**
   * Bir zimmeti siler.
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('zimmetler')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Zimmeti bir personele atar (teslim eder).
   */
  async atamaYap(zimmetId: string, employeeId: string | null): Promise<Zimmet> {
    const bugun = new Date().toISOString().split('T')[0];
    
    const updates: Partial<ZimmetInsert> = {
      atanan_employee_id: employeeId,
      durum: employeeId ? 'aktif' : 'iade-edildi',
      atanma_tarihi: employeeId ? bugun : null,
      iade_tarihi: employeeId ? null : bugun
    };

    return this.update(zimmetId, updates);
  }
};
