import React from 'react';
import { Settings, FileText, CheckCircle, Clock } from 'lucide-react';

const IsAkisi: React.FC = () => {
  const columns = [
    { id: 'bekleyen', title: 'Bekleyen İşlemler', color: 'border-yellow-200 bg-yellow-50', headerColor: 'text-yellow-800 bg-yellow-100', icon: Clock,
      tasks: [
        { id: 1, title: 'Yeni Personel SGK Girişi', desc: 'Ahmet Yılmaz - BT Departmanı', date: 'Bugün' },
        { id: 2, title: 'İzin Onay Bekliyor', desc: 'Ayşe Demir - İK Departmanı', date: 'Yarın' }
      ]
    },
    { id: 'islemde', title: 'İşlemde', color: 'border-blue-200 bg-blue-50', headerColor: 'text-blue-800 bg-blue-100', icon: Settings,
      tasks: [
        { id: 3, title: 'Performans Değerlendirme', desc: 'Q3 Değerlendirmeleri', date: 'Sürekli' },
        { id: 4, title: 'Bordro Hesaplamaları', desc: 'Ocak Ayı Maaşları', date: 'Devam Ediyor' }
      ]
    },
    { id: 'tamamlanan', title: 'Tamamlanan', color: 'border-green-200 bg-green-50', headerColor: 'text-green-800 bg-green-100', icon: CheckCircle,
      tasks: [
        { id: 5, title: 'Oryantasyon Süreci', desc: 'Mehmet Kaya', date: 'Dün' },
        { id: 6, title: 'KVKK Eğitimleri', desc: 'Tüm Şirket', date: 'Geçen Hafta' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">İş Akışı Gösterimi</h2>
        <p className="text-sm text-gray-500 mt-1">
          Operasyonel İK süreçlerinin anlık durum panosu (Kanban).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map(col => (
          <div key={col.id} className={`rounded-xl border ${col.color} overflow-hidden flex flex-col h-[600px]`}>
            <div className={`p-4 flex items-center justify-between border-b ${col.color.replace('bg-', 'border-')} ${col.headerColor}`}>
              <div className="flex items-center gap-2 font-bold">
                <col.icon className="w-5 h-5" />
                {col.title}
              </div>
              <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                {col.tasks.length}
              </span>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {col.tasks.map(task => (
                <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-gray-800">{task.title}</h4>
                    <FileText className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{task.desc}</p>
                  <div className="flex items-center text-xs text-gray-500 font-medium">
                    <Clock className="w-3 h-3 mr-1" />
                    {task.date}
                  </div>
                </div>
              ))}
              
              {col.id === 'bekleyen' && (
                <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:bg-white hover:border-gray-400 transition-colors">
                  + Yeni Görev Ekle
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IsAkisi;
