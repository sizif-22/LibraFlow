'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Loader2, Info, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import { notificationsApi } from '@/lib/api/notifications';
import { Notification, NotificationType } from '@/lib/types/notification';

const NOTIFICATION_ICONS: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  [NotificationType.BORROW_APPROVED]: { icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  [NotificationType.BORROW_REJECTED]: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  [NotificationType.FINE_ADDED]: { icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  [NotificationType.DUE_REMINDER]: { icon: Calendar, color: 'text-sky-400', bg: 'bg-sky-500/10' },
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsApi.getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const fmt = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-slate-300 hover:text-white"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 glass-dark border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 className="font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                {unreadCount} NEW
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <Info size={32} className="mx-auto text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => {
                  const cfg = NOTIFICATION_ICONS[n.type];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                      className={`p-4 hover:bg-white/5 transition-colors cursor-pointer relative group ${!n.isRead ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                          <Icon size={18} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!n.isRead ? 'text-white font-medium' : 'text-slate-400'}`}>
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                            {fmt(n.createdAt)}
                          </p>
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10 bg-white/5 text-center">
            <button className="text-xs text-slate-400 hover:text-white transition-colors font-medium">
              See all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
