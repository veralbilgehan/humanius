import re

with open('src/components/BordroOnay.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_content = re.sub(r'<div className="bg-white/60 rounded-lg p-3 border border-blue-200">\s*<div className="flex items-center gap-2 mb-1">\s*<div className="bg-blue-100 rounded p-1">\s*<PenTool className="w-4 h-4 text-blue-600" />\s*</div>\s*<span className="text-xs font-semibold text-blue-900">Dijital İmza</span>\s*</div>\s*<p className="text-xs text-blue-600">Ekranda imza atarak onaylayın</p>\s*</div>\s*<div className="bg-white/60 rounded-lg p-3 border border-blue-200">\s*<div className="flex items-center gap-2 mb-1">\s*<div className="bg-blue-100 rounded p-1">\s*<Upload className="w-4 h-4 text-blue-600" />\s*</div>\s*<span className="text-xs font-semibold text-blue-900">Kimlik Belgesi</span>\s*</div>\s*<p className="text-xs text-blue-600">Kimlik/Ehliyet yükleyin</p>\s*</div>', '', content)

new_content = new_content.replace('3 Doğrulama Seçeneği', 'Şifreli Doğrulama')
new_content = new_content.replace('Size en uygun doğrulama yöntemini seçebilirsiniz:', 'Bordronuzu kişisel şifrenizle güvenle onaylayabilirsiniz:')

new_content = new_content.replace("useState<'signature' | 'id_document' | 'passcode'>('signature')", "useState<'passcode'>('passcode')")

methods_buttons = r'<h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">Doğrulama Yöntemi</h3>\s*<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">.*?</div>\s*<div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-xl">'
new_content = re.sub(methods_buttons, '<div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-xl">', new_content, flags=re.DOTALL)

# Add grid-cols-1 to the remaining header items
new_content = new_content.replace('grid grid-cols-1 md:grid-cols-3 gap-3', 'grid grid-cols-1 gap-3')

with open('src/components/BordroOnay.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
