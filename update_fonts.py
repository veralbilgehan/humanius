with open('src/components/GorevTanimi.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Increase text size for the header dates
content = content.replace('<div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-300">', '<div className="mt-4 flex flex-wrap gap-6 text-base font-medium text-slate-200">')
content = content.replace('className="rounded border-0 bg-white/10 px-2 py-1 text-white"', 'className="rounded border-0 bg-white/10 px-3 py-1.5 text-white text-base"')
content = content.replace('className="w-16 rounded border-0 bg-white/10 px-2 py-1 text-white"', 'className="w-16 rounded border-0 bg-white/10 px-3 py-1.5 text-white text-base"')

# Increase the tag text size
content = content.replace('<span className="rounded-full bg-green-600 px-4 py-1 text-sm">', '<span className="rounded-full bg-green-600 px-4 py-2 text-base shadow-sm">')

# Increase the Personel Secimi label
content = content.replace('<label className="text-sm font-medium text-slate-700">Personel Seçimi:</label>', '<label className="text-base font-semibold text-slate-800">Personel Seçimi:</label>')

# Increase the label sizes below
content = content.replace('mb-1 block text-sm font-semibold text-slate-700', 'mb-2 block text-base font-bold text-slate-800')

# Also look for any standard labels like Pozisyon Adi etc.
content = content.replace('text-sm font-semibold text-slate-700', 'text-base font-bold text-slate-800')

with open('src/components/GorevTanimi.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
