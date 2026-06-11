import React, { useState } from 'react';
import { Clock, LogIn, LogOut, Search, Filter } from 'lucide-react';
import type { Employee } from '../types';

interface PdksDevamProps {
  employees: Employee[];
}

const PdksDevam: React.FC<PdksDevamProps> = ({ employees }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dummy data for PDKS
  const mockPdksData = employees.map(emp => {
    const isLate = Math.random() > 0.8;
    const isAbsent = Math.random() > 0.95;
    return {
      employee: emp,
      giris: isAbsent ? '-' : (isLate ? '09:15' : '08:50'),
      cikis: isAbsent ? '-' : '18:05',
      durum: isAbsent ? 'Devamsız' : (isLate ? 'Geç Kaldı' : 'Zamanında'),
      mesai: isAbsent ? 0 : 9,
    };
  });

  const filteredData = mockPdksData.filter(d => 
    !searchTerm || d.employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Devam Kontrolü (PDKS)</h2>
          <p className="text-sm text-gray-500 mt-1">
            Günlük personel giriş çıkış saatleri ve devam durumları.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            <span className="font-bold">Zamanında: {mockPdksData.filter(d => d.durum === 'Zamanında').length}</span>
          </div>
          <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-bold">Geç Kalan: {mockPdksData.filter(d => d.durum === 'Geç Kaldı').length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Personel ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
          <Filter className="w-4 h-4" />
          Filtrele
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Personel</th>
              <th className="px-6 py-4">Departman</th>
              <th className="px-6 py-4 text-center">Giriş Saati</th>
              <th className="px-6 py-4 text-center">Çıkış Saati</th>
              <th className="px-6 py-4 text-center">Çalışma Süresi</th>
              <th className="px-6 py-4 text-right">Durum</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((d, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{d.employee.name}</td>
                <td className="px-6 py-4 text-gray-600">{d.employee.department}</td>
                <td className="px-6 py-4 text-center font-medium text-gray-800">{d.giris}</td>
                <td className="px-6 py-4 text-center font-medium text-gray-800">{d.cikis}</td>
                <td className="px-6 py-4 text-center text-gray-600">{d.mesai} Saat</td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    d.durum === 'Zamanında' ? 'bg-green-100 text-green-700' :
                    d.durum === 'Geç Kaldı' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {d.durum}
                  </span>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Kayıt bulunamadı.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PdksDevam;
