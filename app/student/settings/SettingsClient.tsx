'use client';

import { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Bell, User, Moon, Shield, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsClientProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

type Tab = 'account' | 'notifications' | 'privacy' | 'appearance';

export default function SettingsClient({ user }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('account');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Settings Navigation Sidebar */}
      <div className="md:col-span-1 space-y-2">
        <button 
          onClick={() => setActiveTab('account')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
            activeTab === 'account' ? "bg-brand-primary text-white" : "text-gray-700 hover:bg-white/80"
          )}
        >
          <User className="w-5 h-5" />
          Account
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
            activeTab === 'notifications' ? "bg-brand-primary text-white" : "text-gray-700 hover:bg-white/80"
          )}
        >
          <Bell className="w-5 h-5" />
          Notifications
        </button>
        <button 
          onClick={() => setActiveTab('privacy')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
            activeTab === 'privacy' ? "bg-brand-primary text-white" : "text-gray-700 hover:bg-white/80"
          )}
        >
          <Shield className="w-5 h-5" />
          Privacy & Security
        </button>
        <button 
          onClick={() => setActiveTab('appearance')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
            activeTab === 'appearance' ? "bg-brand-primary text-white" : "text-gray-700 hover:bg-white/80"
          )}
        >
          <Moon className="w-5 h-5" />
          Appearance
        </button>
      </div>

      {/* Settings Content Area */}
      <div className="md:col-span-2 space-y-6">
        
        {activeTab === 'account' && (
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-primary" />
              Profile Settings
            </h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  defaultValue={user.name || ''} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-white/50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  defaultValue={user.email || ''} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-white/50"
                  readOnly
                />
              </div>
              <p className="mt-4 text-sm text-gray-500">Manage your sign-in details from the account menu in the sidebar.</p>
            </form>
          </GlassCard>
        )}

        {activeTab === 'privacy' && (
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-brand-primary" />
              Change Password
            </h2>
            
            <form className="space-y-4">
              <p className="text-gray-600">Password, multi-factor authentication, and connected accounts are managed securely through Clerk. Open the account menu in the sidebar to update them.</p>
            </form>
          </GlassCard>
        )}

        {activeTab === 'notifications' && (
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand-primary" />
              Preferences
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive emails about your activity and new competitions.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium text-gray-900">Marketing Emails</h3>
                  <p className="text-sm text-gray-500">Receive emails about new features and offers.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>
            </div>
          </GlassCard>
        )}

        {activeTab === 'appearance' && (
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Moon className="w-5 h-5 text-brand-primary" />
              Appearance
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium text-gray-900">Dark Mode</h3>
                  <p className="text-sm text-gray-500">Switch to a darker theme for the interface.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>
            </div>
          </GlassCard>
        )}

      </div>
    </div>
  );
}
