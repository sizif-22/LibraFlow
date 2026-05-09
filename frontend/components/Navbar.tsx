/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Bell, CheckCheck, Clock, Check } from 'lucide-react';
import { notificationsApi } from '@/lib/api/notifications';
import { Notification } from '@/lib/types/notification';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Fetch notifications if user is student
  useEffect(() => {
    let isSubscribed = true;

    const loadNotifications = async () => {
      if (user?.role === 'STUDENT') {
        try {
          const data = await notificationsApi.getMyNotifications();
          if (isSubscribed) {
            setNotifications(data);
          }
        } catch (err) {
          if (isSubscribed) {
            console.error('Failed to fetch notifications:', err);
          }
        }
      }
    };

    loadNotifications();

    let interval: any;
    if (user?.role === 'STUDENT') {
      interval = setInterval(loadNotifications, 30000);
    }

    return () => {
      isSubscribed = false;
      if (interval) clearInterval(interval);
    };
  }, [user]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide navbar on login, register, and librarian pages
  if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/librarian')) {
    return null;
  }

  const isStudent = user?.role === 'STUDENT';
  const isLibrarian = user?.role === 'LIBRARIAN';
  const isAdmin = user?.role === 'ADMIN';

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navLinks = [
    ...(isStudent ? [
      { label: 'Catalog', href: '/books' },
      { label: 'My Borrows', href: '/student/borrows' },
    ] : []),
    { 
      label: 'Dashboard', 
      href: isAdmin ? '/admin/dashboard' : isLibrarian ? '/librarian/dashboard' : '/student/dashboard' 
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0d0d0d] border-b border-[#1f1f1f] px-10 h-20 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[18px] font-extrabold tracking-tight text-white">
            LibraFlow
          </span>
        </Link>

        <div className="flex items-center gap-8">
          {isMounted && navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[14px] transition-colors relative py-1 ${
                    isActive ? 'text-white' : 'text-[#888888] hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-white" />
                  )}
                </Link>
              );
            })}
          </div>
      </div>

      <div className="flex items-center gap-6">
        {!isMounted ? (
          <div className="w-20 h-8 bg-[#1a1a1a] animate-pulse rounded-[6px]" />
        ) : user ? (
          <div className="flex items-center gap-4">
            
            {/* Notification Bell */}
            {isStudent && (
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative ${
                    isNotificationsOpen ? 'bg-white text-black' : 'bg-[#1a1a1a] text-[#888888] hover:text-white border border-[#333333]'
                  }`}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0d0d0d]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[380px] bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-4 border-b border-[#1f1f1f] flex items-center justify-between bg-[#111111]/50 backdrop-blur-xl">
                      <h3 className="text-[14px] font-bold text-white uppercase tracking-wider">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} NEW
                        </span>
                      )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={`px-5 py-4 border-b border-[#1f1f1f] hover:bg-[#1a1a1a] transition-all relative group ${!n.isRead ? 'bg-[#151515]' : ''}`}
                          >
                            <div className="flex gap-4">
                              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${!n.isRead ? 'bg-white text-black' : 'bg-[#1f1f1f] text-[#555555]'}`}>
                                <Bell size={14} />
                              </div>
                              <div className="flex-1">
                                <p className={`text-[13px] leading-relaxed ${!n.isRead ? 'text-white font-medium' : 'text-[#888888]'}`}>
                                  {n.message}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock size={12} className="text-[#555555]" />
                                  <span className="text-[10px] text-[#555555] font-medium">
                                    {new Date(n.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              {!n.isRead && (
                                <button 
                                  onClick={() => handleMarkAsRead(n.id)}
                                  className="w-6 h-6 rounded-full bg-[#222222] flex items-center justify-center text-[#888888] hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100"
                                  title="Mark as read"
                                >
                                  <Check size={12} />
                                </button>
                              )}
                            </div>
                            {!n.isRead && (
                              <div className="absolute left-0 top-0 w-1 h-full bg-white" />
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center px-10">
                          <div className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center mb-4 border border-[#1f1f1f]">
                            <Bell size={20} className="text-[#333333]" />
                          </div>
                          <p className="text-[13px] text-[#555555] font-medium">No notifications yet</p>
                          <p className="text-[11px] text-[#333333] mt-1">We&apos;ll alert you when something important happens.</p>
                        </div>
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="p-3 bg-[#111111]/50 backdrop-blur-xl border-t border-[#1f1f1f]">
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="w-full py-2.5 text-[11px] font-bold text-[#888888] hover:text-white uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCheck size={14} />
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#333333] flex items-center justify-center text-white text-[14px] font-semibold hover:bg-[#222222] transition-all uppercase"
              >
                {user?.name ? user.name.charAt(0) : 'U'}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-[#222222]">
                    <p className="text-[14px] font-semibold text-white truncate">{user?.name || 'User'}</p>
                    <p className="text-[12px] text-[#888888] truncate mt-0.5">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] text-[#aaaaaa] hover:text-white hover:bg-[#222222] transition-colors flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[14px] text-[#888888] hover:text-white transition-colors">
              Login
            </Link>
            <Link
              href="/register"
              className="text-[14px] bg-white text-black px-5 py-2 rounded-[6px] font-medium hover:bg-gray-200 transition-all"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
