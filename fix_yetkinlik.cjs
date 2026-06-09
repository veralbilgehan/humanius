const fs = require('fs');
let content = fs.readFileSync('src/components/YetkinlikMatrisi.tsx', 'utf8');

// Update labels
content = content.replace(
  /const SEVİYE_ETIKET = \['Yok', 'Başlangıç', 'Temel', 'Orta', 'İleri', 'Uzman'\];/,
  `const SEVİYE_ETIKET = ['%0 (Yok)', '%20 (Başlangıç)', '%40 (Temel)', '%60 (Orta)', '%80 (İleri)', '%100 (Uzman)'];`
);

// Update Gap analysis description (1/5) to (%20)
content = content.replace(
  /<p className="text-\[10px\] text-gray-500 mt-0\.5">\{SEVİYE_ETIKET\[item\.mevcutSeviye\]\} \(\{item\.mevcutSeviye\}\/5\)/g,
  `<p className="text-[10px] text-gray-500 mt-0.5">{SEVİYE_ETIKET[item.mevcutSeviye]}`
);

content = content.replace(
  /<p className="text-\[10px\] text-gray-500 mt-0\.5">\{SEVİYE_ETIKET\[item\.minSeviye\]\} \(\{item\.minSeviye\}\/5\)/g,
  `<p className="text-[10px] text-gray-500 mt-0.5">{SEVİYE_ETIKET[item.minSeviye]}`
);

// Update bottom legend {i} — {e} -> just {e} (because e already has % number)
content = content.replace(
  /\{i\} — \{e\}/g,
  `{e}`
);

fs.writeFileSync('src/components/YetkinlikMatrisi.tsx', content, 'utf8');
console.log('Replaced successfully');
