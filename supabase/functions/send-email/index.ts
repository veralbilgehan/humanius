import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, type, data } = await req.json();

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not set in Edge Function secrets");
    }

    // HTML Şablonunu Oluştur
    let htmlContent = '';
    
    if (type === 'bordro') {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #2563eb;">Bordro Onay Bildirimi</h2>
          <p>Merhaba <strong>${data.employeeName}</strong>,</p>
          <p><strong>${data.period}</strong> dönemine ait bordronuz ilgili yönetici/departman tarafından onaylanmıştır.</p>
          <p>Bordro detaylarınızı Humanius portalı üzerinden "Özlük Dosyam" -> "Bordrolarım" sekmesinden görüntüleyebilirsiniz.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">Bu otomatik bir bilgilendirme mesajıdır. Lütfen cevaplamayınız.</p>
        </div>
      `;
    } else if (type === 'gorev-tanimi') {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #2563eb;">Görev Tanımı Onay Bildirimi</h2>
          <p>Merhaba <strong>${data.employeeName}</strong>,</p>
          <p><strong>${data.positionName}</strong> pozisyonu için görev tanımınız onaylanmış ve kayıt altına alınmıştır.</p>
          <p>Görev tanımı detaylarınıza Humanius portalı üzerinden ulaşabilirsiniz.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">Bu otomatik bir bilgilendirme mesajıdır. Lütfen cevaplamayınız.</p>
        </div>
      `;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'Humanius HR <onboarding@resend.dev>', // Üretime alırken şirket domaininizle değiştirin
        to: [to],
        subject: subject,
        html: htmlContent
      })
    });

    const responseData = await res.json();

    if (!res.ok) {
      throw new Error(`Resend Error: ${JSON.stringify(responseData)}`);
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
