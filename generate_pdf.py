from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, 'Humanius Sistem Rol ve Yetki Matrisi', border=0, align='C')
        self.ln(15)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, 'Sayfa %s' % self.page_no(), align='C')

# Data
columns = ['Modul / Ekran', 'Sirket Admini', 'Admin', 'HR', 'Personel']
data = [
    ['Arama', 'EVET', 'EVET', 'EVET', 'HAYIR'],
    ['Personel Yonetimi', 'EVET', 'EVET', 'EVET', 'HAYIR'],
    ['Bordro Goruntuleme', 'EVET', 'EVET', 'EVET', 'EVET (Kendi)'],
    ['Bordro Onay Yonetimi', 'EVET', 'EVET', 'EVET', 'HAYIR'],
    ['Izin Yonetimi', 'EVET', 'EVET', 'EVET', 'EVET (Kendi)'],
    ['Izin Tanimlari', 'EVET', 'EVET', 'EVET', 'HAYIR'],
    ['Izin Cakisma Analizi', 'EVET', 'EVET', 'EVET', 'HAYIR'],
    ['Raporlar', 'EVET', 'EVET', 'EVET', 'HAYIR'],
    ['Analitik', 'EVET', 'EVET', 'EVET', 'HAYIR'],
    ['Uyari Sistemi', 'EVET', 'EVET', 'EVET', 'EVET (Kendi)'],
    ['Sistem Ayarlari', 'EVET', 'EVET', 'EVET', 'HAYIR'],
    ['Kullanicilar', 'EVET', 'EVET', 'EVET', 'HAYIR'],
    ['Gorev Tanimi', 'EVET', 'EVET', 'EVET', 'HAYIR'],
    ['Gorev Tanimi Kayitlari', 'EVET', 'EVET', 'EVET', 'HAYIR'],
    ['Ozluk Dosyasi', 'EVET', 'EVET', 'EVET', 'EVET (Kendi)'],
    ['PDKS (Zaman Kontrolu)', 'EVET', 'EVET', 'EVET', 'EVET (Kendi)'],
    ['Performans', 'EVET', 'EVET', 'EVET', 'EVET (Kendi)'],
    ['Ise Alim', 'EVET', 'EVET', 'EVET', 'HAYIR'],
    ['Egitim', 'EVET', 'EVET', 'EVET', 'EVET (Kendi)'],
    ['KVKK', 'EVET', 'EVET', 'EVET', 'HAYIR'],
    ['Org. Sema', 'EVET', 'EVET', 'EVET', 'HAYIR'],
    ['Zimmet', 'EVET', 'EVET', 'EVET', 'EVET (Kendi)'],
    ['OKR', 'EVET', 'EVET', 'EVET', 'EVET (Kendi)'],
    ['Yetkinlik', 'EVET', 'EVET', 'EVET', 'EVET (Kendi)'],
    ['Onboarding', 'EVET', 'EVET', 'EVET', 'HAYIR'],
    ['Yan Haklar', 'EVET', 'EVET', 'EVET', 'EVET (Kendi)'],
    ['Form Builder', 'EVET', 'EVET', 'HAYIR', 'HAYIR'],
    ['Kullanim Kilavuzu', 'EVET', 'EVET', 'EVET', 'EVET']
]

pdf = PDF(orientation='P', unit='mm', format='A4')
pdf.add_page()
pdf.set_font("helvetica", size=9)

col_widths = [50, 35, 35, 35, 35]
line_height = 8

# Header
pdf.set_font("helvetica", 'B', 10)
pdf.set_fill_color(230, 230, 230)
for i, col in enumerate(columns):
    pdf.cell(col_widths[i], line_height, col, border=1, align='C', fill=True)
pdf.ln(line_height)

# Rows
pdf.set_font("helvetica", size=9)
for row in data:
    for i, item in enumerate(row):
        align = 'L' if i == 0 else 'C'
        if item == 'EVET':
            pdf.set_text_color(0, 128, 0) # Green
        elif item == 'HAYIR':
            pdf.set_text_color(200, 0, 0) # Red
        elif item == 'EVET (Kendi)':
            pdf.set_text_color(0, 100, 200) # Blue
        else:
            pdf.set_text_color(0, 0, 0)
        
        # Reset color for the first column
        if i == 0:
            pdf.set_text_color(0, 0, 0)
            
        pdf.cell(col_widths[i], line_height, str(item), border=1, align=align)
    pdf.ln(line_height)

pdf.ln(10)
pdf.set_text_color(100, 100, 100)
pdf.set_font("helvetica", 'I', 8)
pdf.cell(0, 10, '* "Personel" rolu altindaki modullerdeki gorunumler sadece personelin kendi verileri (bordro, izin, vs) ile sinirlidir.', align='C')

pdf.output('Roller_Yetkiler.pdf')
