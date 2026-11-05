'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarPickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export const CalendarPicker: React.FC<CalendarPickerProps> = ({ selectedDate, onSelectDate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const getFormattedDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getFormattedDate(new Date());

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = getFormattedDate(tomorrowDate);

  const dayAfterDate = new Date();
  dayAfterDate.setDate(dayAfterDate.getDate() + 2);
  const dayAfterStr = getFormattedDate(dayAfterDate);

  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return 'Tarih Seçin';
    const d = new Date(dStr);
    const dayName = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][d.getDay()];
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}, ${dayName}`;
  };

  return (
    <div className="space-y-3">
      {/* Üst Tarih Çubuğu & Hızlı Seçim Butonları */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 p-3.5 rounded-xl flex items-center justify-between text-left transition shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 group-hover:bg-amber-100 transition">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">Randevu Tarihi</div>
              <div className="text-sm font-bold text-slate-900">
                {formatDisplayDate(selectedDate)}
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
            {isOpen ? 'Takvimi Kapat ▲' : 'Takvimden Değiştir ▼'}
          </span>
        </button>

        {/* Hızlı Butonlar */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSelectDate(todayStr)}
            className={`px-3.5 py-3 rounded-xl text-xs font-bold transition border ${
              selectedDate === todayStr
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Bugün
          </button>
          <button
            type="button"
            onClick={() => onSelectDate(tomorrowStr)}
            className={`px-3.5 py-3 rounded-xl text-xs font-bold transition border ${
              selectedDate === tomorrowStr
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Yarın
          </button>
          <button
            type="button"
            onClick={() => onSelectDate(dayAfterStr)}
            className={`px-3.5 py-3 rounded-xl text-xs font-bold transition border ${
              selectedDate === dayAfterStr
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Sonraki Gün
          </button>
        </div>
      </div>

      {/* AÇILIR AY TAKVİMİ */}
      {isOpen && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-600" />
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                title="Önceki Ay"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                title="Sonraki Ay"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAY_NAMES.map((d, idx) => (
              <div key={idx} className="text-[11px] font-bold text-slate-400 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-9" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const cellDate = new Date(currentYear, currentMonth, dayNum);
              cellDate.setHours(0, 0, 0, 0);

              const dateFormatted = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isPast = cellDate < today;
              const isSelected = selectedDate === dateFormatted;
              const isToday = todayStr === dateFormatted;

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  disabled={isPast}
                  onClick={() => {
                    onSelectDate(dateFormatted);
                    setIsOpen(false);
                  }}
                  className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition relative ${
                    isSelected
                      ? 'bg-slate-900 text-white font-bold shadow-md'
                      : isPast
                      ? 'text-slate-300 cursor-not-allowed line-through'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  } ${isToday && !isSelected ? 'border border-amber-500 text-amber-700 font-bold' : ''}`}
                >
                  {dayNum}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
