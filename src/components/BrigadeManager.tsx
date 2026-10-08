import React, { useState } from 'react';
import { Brigade, Foreman, Stage } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface BrigadeManagerProps {
  brigades: Brigade[];
  foremen: Foreman[];
  stages: Stage[];
  onSaveBrigade: (brigade: Brigade) => void;
  onDeleteBrigade: (id: string) => void;
  onSaveForeman: (foreman: Foreman) => void;
  onDeleteForeman: (id: string) => void;
}

export default function BrigadeManager({ brigades, foremen, stages, onSaveBrigade, onDeleteBrigade, onSaveForeman, onDeleteForeman }: BrigadeManagerProps) {
  const [showBrigadeForm, setShowBrigadeForm] = useState(false);
  const [editingBrigade, setEditingBrigade] = useState<Brigade | null>(null);
  const [bName, setBName] = useState('');
  const [bSpecialty, setBSpecialty] = useState('');

  const [showForemanForm, setShowForemanForm] = useState(false);
  const [editingForeman, setEditingForeman] = useState<Foreman | null>(null);
  const [fName, setFName] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fPin, setFPin] = useState('');
  const [fCrewId, setFCrewId] = useState('');

  const resetBrigadeForm = () => { setBName(''); setBSpecialty(''); setEditingBrigade(null); setShowBrigadeForm(false); };
  const resetForemanForm = () => { setFName(''); setFPhone(''); setFPin(''); setFCrewId(''); setEditingForeman(null); setShowForemanForm(false); };

  const handleSaveBrigade = () => {
    if (!bName.trim()) return;
    if (editingBrigade) {
      onSaveBrigade({ ...editingBrigade, name: bName, specialty: bSpecialty });
    } else {
      onSaveBrigade({ id: uuidv4(), name: bName, specialty: bSpecialty });
    }
    resetBrigadeForm();
  };

  const handleSaveForeman = () => {
    if (!fName.trim() || !fCrewId) return;
    if (editingForeman) {
      onSaveForeman({ ...editingForeman, name: fName, phone: fPhone, pin: fPin, crewId: fCrewId });
    } else {
      onSaveForeman({ id: uuidv4(), name: fName, phone: fPhone, pin: fPin, crewId: fCrewId });
    }
    resetForemanForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Бригады и прорабы</h1>
          <p className="text-gray-500 mt-1">Управление рабочими бригадами и ответственными лицами</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { resetForemanForm(); setShowForemanForm(true); }} className="bg-purple-600 text-white px-4 py-2.5 rounded-xl hover:bg-purple-700 transition flex items-center gap-2 shadow-sm font-medium text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Новый прораб
          </button>
          <button onClick={() => { resetBrigadeForm(); setShowBrigadeForm(true); }} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow-sm font-medium text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Новая бригада
          </button>
        </div>
      </div>

      {/* Brigade Form Modal */}
      {showBrigadeForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingBrigade ? 'Редактировать бригаду' : 'Новая бригада'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Название бригады *</label>
                <input type="text" value={bName} onChange={e => setBName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Бригада №1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Специализация</label>
                <select value={bSpecialty} onChange={e => setBSpecialty(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Выберите специализацию</option>
                  <option value="Общестроительные работы">Общестроительные работы</option>
                  <option value="Монолитные работы">Монолитные работы</option>
                  <option value="Каменная кладка">Каменная кладка</option>
                  <option value="Кровля и фасад">Кровля и фасад</option>
                  <option value="Отделочные работы">Отделочные работы</option>
                  <option value="Электромонтажные работы">Электромонтажные работы</option>
                  <option value="Сантехнические работы">Сантехнические работы</option>
                  <option value="Благоустройство">Благоустройство</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={resetBrigadeForm} className="px-5 py-2.5 text-gray-600 hover:text-gray-800 transition rounded-xl hover:bg-gray-100">Отмена</button>
              <button onClick={handleSaveBrigade} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium">{editingBrigade ? 'Сохранить' : 'Создать'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Foreman Form Modal */}
      {showForemanForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingForeman ? 'Редактировать прораба' : 'Новый прораб'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ФИО *</label>
                <input type="text" value={fName} onChange={e => setFName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Иванов Иван Иванович" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Бригада *</label>
                <select value={fCrewId} onChange={e => setFCrewId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="">Выберите бригаду</option>
                  {brigades.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Телефон</label>
                <input type="tel" value={fPhone} onChange={e => setFPhone(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="+7 (999) 123-45-67" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">PIN-код</label>
                <input type="text" value={fPin} onChange={e => setFPin(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="1234" maxLength={4} />
                <p className="text-xs text-gray-400 mt-1">Для авторизации прораба в системе</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={resetForemanForm} className="px-5 py-2.5 text-gray-600 hover:text-gray-800 transition rounded-xl hover:bg-gray-100">Отмена</button>
              <button onClick={handleSaveForeman} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition font-medium">{editingForeman ? 'Сохранить' : 'Создать'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Brigades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {brigades.map(brigade => {
          const brigadeForemen = foremen.filter(f => f.crewId === brigade.id);
          const brigadeStages = stages.filter(s => s.crewId === brigade.id);
          const activeStages = brigadeStages.filter(s => s.status !== 'done');
          
          return (
            <div key={brigade.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{brigade.name}</h3>
                    {brigade.specialty && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{brigade.specialty}</span>}
                  </div>
                </div>
                <button onClick={() => onDeleteBrigade(brigade.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-blue-50 rounded-xl p-2.5 text-center">
                  <div className="text-lg font-bold text-blue-700">{brigadeStages.length}</div>
                  <div className="text-[10px] text-blue-500">Всего этапов</div>
                </div>
                <div className="flex-1 bg-amber-50 rounded-xl p-2.5 text-center">
                  <div className="text-lg font-bold text-amber-700">{activeStages.length}</div>
                  <div className="text-[10px] text-amber-500">Активных</div>
                </div>
              </div>

              {brigadeForemen.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Прорабы</p>
                  <div className="space-y-2">
                    {brigadeForemen.map(f => (
                      <div key={f.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{f.name}</p>
                          <p className="text-xs text-gray-400">{f.phone}</p>
                        </div>
                        <button onClick={() => onDeleteForeman(f.id)} className="p-1 text-gray-400 hover:text-red-500 transition">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => { setEditingBrigade(brigade); setBName(brigade.name); setBSpecialty(brigade.specialty); setShowBrigadeForm(true); }} className="mt-3 w-full text-sm text-blue-600 hover:text-blue-700 py-2 rounded-xl hover:bg-blue-50 transition font-medium">
                Редактировать бригаду
              </button>
            </div>
          );
        })}
      </div>
      
      {brigades.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="text-6xl mb-4">👷</div>
          <p className="text-gray-500 text-lg mb-2">Пока нет бригад</p>
          <p className="text-gray-400 text-sm">Нажмите «Новая бригада» чтобы добавить первую</p>
        </div>
      )}
    </div>
  );
}
