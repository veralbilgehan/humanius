import { supabase } from '../lib/supabase';

export const emailService = {
  /**
   * Bordro onayı tamamlandıktan sonra personele bildirim gönderir.
   */
  async sendBordroApprovalEmail(email: string, employeeName: string, period: string) {
    if (!email) {
      console.warn('E-posta adresi bulunmadığı için bordro onay maili gönderilmedi.');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: `${period} Dönemi Bordronuz Onaylanmıştır`,
          type: 'bordro',
          data: {
            employeeName,
            period,
          }
        }
      });

      if (error) throw error;
      console.log('Bordro onay e-postası başarıyla gönderildi:', data);
      return true;
    } catch (error) {
      console.error('Bordro onay e-postası gönderilirken hata oluştu:', error);
      return false;
    }
  },

  /**
   * Görev tanımı onaylandıktan sonra personele bildirim gönderir.
   */
  async sendGorevTanimiEmail(email: string, employeeName: string, positionName: string) {
    if (!email) {
      console.warn('E-posta adresi bulunmadığı için görev tanımı onay maili gönderilmedi.');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'Görev Tanımınız Onaylanmıştır',
          type: 'gorev-tanimi',
          data: {
            employeeName,
            positionName,
          }
        }
      });

      if (error) throw error;
      console.log('Görev tanımı onay e-postası başarıyla gönderildi:', data);
      return true;
    } catch (error) {
      console.error('Görev tanımı onay e-postası gönderilirken hata oluştu:', error);
      return false;
    }
  }
};
