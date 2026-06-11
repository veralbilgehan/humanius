import os

file_path = r"e:\projects\Humaniuss-master\src\components\OzlukDosyasi.tsx"

# We will read the file as binary, decode with utf-8, replace, and write back.
with open(file_path, "rb") as f:
    content = f.read()

# Let's inspect typical corruptions and replace them.
# The file has things like:
# 'İx Yeri Girix' -> we can search and replace bytes or strings.
# Since we decoded as UTF-8 in the view tool and it output weird things, let's decode with errors="replace" or "ignore" or read as UTF-8.
# Actually, let's decode as utf-8, replace the substrings, and write back.

try:
    text = content.decode("utf-8")
except Exception as e:
    print("Decoding as utf-8 failed, trying latin-1...")
    text = content.decode("latin-1")

replacements = {
    "İx Yeri Girix Bildirgesi": "İş Yeri Giriş Bildirgesi",
    "İxe girix": "İşe giriş",
    "ixe girix": "işe giriş",
    "Savcılıxından": "Savcılığından",
    "yerlexim": "yerleşim",
    "Dixer": "Diğer",
    "dixer": "diğer",
    "~ikayetler": "Şikayetler",
    "Doxum": "Doğum",
    " lüm": "Ölüm",
    "Scretsiz": "Ücretsiz",
    "!alıxma": "Çalışma",
    "!alıxan": "Çalışan",
    "İxe Girix Tarihi": "İşe Giriş Tarihi",
    "!alıxma Süresi": "Çalışma Süresi",
    "geçmixi": "geçmişi",
    "onaylanmıx": "onaylanmış",
    "Baxlı": "Bağlı",
    "Baxlangıç": "Başlangıç",
    "Bitix": "Bitiş",
    " zlük": "Özlük",
    "~ifre": "Şifre",
    "dexil": "değil",
    "erixmek": "erişmek",
    "xifreyi": "şifreyi",
    "Scret": "Ücret",
    "!alıxmalar": "Çalışmalar",
    "~ikayet": "Şikayet",
    "!alıxana": "Çalışana",
    "xikayet": "şikayet",
    "bilexenler": "bileşenler",
    "baxlatılamadı": "başlatılamadı",
    " ": "₺ ",
    "İx Yeri": "İş Yeri",
    "girix": "giriş",
}

for old, new in replacements.items():
    text = text.replace(old, new)

# Also let's clean up any weird comment lines with block symbols:
# E.g. '//     Belge kategorileri'
# We will use regex or simple replacement to replace the corrupted comment lines with clean comments
import re
text = re.sub(r"//\s*\s*\s*\s*", "//", text)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Fixed encoding in OzlukDosyasi.tsx successfully!")
