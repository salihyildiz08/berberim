'use client';

import React from 'react';
import { Bell, Scissors, X } from 'lucide-react';

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  actions?: { label: string; action: () => void; variant?: 'success' | 'danger' }[];
}

interface NotificationToastProps {
  notifications: PushNotification[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-lg animate-in slide-in-from-top-3 duration-300 transition-all text-slate-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-xs">
                <Scissors className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1">
                  <Bell className="w-3 h-3 text-slate-700" /> BİLDİRİM
                </span>
                <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
              </div>
            </div>
            <button
              onClick={() => onDismiss(n.id)}
              className="text-slate-400 hover:text-slate-700 transition p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-10">{n.message}</p>

          {n.actions && n.actions.length > 0 && (
            <div className="mt-2.5 pl-10 flex gap-2">
              {n.actions.map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    act.action();
                    onDismiss(n.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    act.variant === 'danger'
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {act.label}
                </button>
              ))}
            </div>
          )}

          <div className="mt-2 pl-10 text-[10px] text-slate-400 font-mono">{n.time}</div>
        </div>
      ))}
    </div>
  );
};
