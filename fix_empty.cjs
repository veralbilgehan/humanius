const fs = require('fs');
const file = 'src/components/OzlukDosyasi.tsx';
let content = fs.readFileSync(file, 'utf8');

const emptyStateRegex = /\{!selectedEmpId && \([\s\S]*?<FolderOpen[\s\S]*?<\/div>\n\s*\)\}/;

const newEmptyState = `{!selectedEmpId && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Özlük dosyasını görüntülemek için personel seçin</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Yukarıdaki açılır menüden veya aşağıdaki listeden bir çalışan seçerek devam edin</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {companyEmployees.map(emp => (
              <div 
                key={emp.id} 
                onClick={() => {
                  if (onSelectEmployee) onSelectEmployee(emp.id);
                  setActiveTab('genel');
                }}
                className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all bg-gray-50 hover:bg-blue-50 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                  {emp.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="font-medium text-gray-900 truncate">{emp.name}</div>
                  <div className="text-xs text-gray-500 truncate">{emp.department || 'Departman Yok'}</div>
                </div>
              </div>
            ))}
          </div>
          {companyEmployees.length === 0 && (
             <div className="text-red-500 p-4 bg-red-50 rounded-lg mt-4">Şirketinize ait personel bulunamadı. Lütfen önce sisteme personel ekleyin.</div>
          )}
        </div>
      )}`;

content = content.replace(emptyStateRegex, newEmptyState);
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully replaced empty state');
