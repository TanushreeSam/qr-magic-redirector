import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileOption } from '@/types/profile';
import ProfileManager from './ProfileManager';
import QRCodeDisplay from './QRCodeDisplay';
import { LogOut, User, QrCode } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [profileOptions, setProfileOptions] = useState<ProfileOption[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadProfileOptions();
    }
  }, [user]);

  const loadProfileOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_mappings')
        .select('*')
        .eq('qr_id', user.qrId.replace(/^qr_/, ''))
        .eq('user_id', user.id);

      if (error) {
        console.error('Dashboard: Error loading profile options:', error);
        return;
      }

      if (data && data.length > 0) {
        const options: ProfileOption[] = data.map(mapping => ({
          id: mapping.id,
          type: mapping.type,
          label: mapping.label,
          value: mapping.value,
          isActive: true
        }));
        setProfileOptions(options);
        console.log('Dashboard: Loaded profile options:', options);
      }
    } catch (error) {
      console.error('Dashboard: Error in loadProfileOptions:', error);
    }
  };

  const updateProfileOptions = async (options: ProfileOption[]) => {
    try {
      console.log('Dashboard: Updating profile options:', options);
      
      if (!user?.qrId || !user?.id) {
        console.error('Dashboard: No QR ID or user ID available');
        return;
      }

      const cleanQrId = user.qrId.replace(/^qr_/, '');
      
      // First, remove existing mapping
      const { error: deleteError } = await supabase
        .from('qr_mappings')
        .delete()
        .eq('qr_id', cleanQrId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Dashboard: Error deleting existing mapping:', deleteError);
        return;
      }

      // Then, insert the active option if it exists
      const activeOption = options.find(option => option.isActive);
      if (activeOption) {
        const { error: insertError } = await supabase
          .from('qr_mappings')
          .insert({
            qr_id: cleanQrId,
            type: activeOption.type,
            label: activeOption.label,
            value: activeOption.value,
            user_id: user.id
          });

        if (insertError) {
          console.error('Dashboard: Error inserting new mapping:', insertError);
          return;
        }
      }

      setProfileOptions(options);
      
    } catch (error) {
      console.error('Dashboard: Error in updateProfileOptions:', error);
    }
  };

  const activeOption = profileOptions.find(option => option.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">QR Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                {user?.email}
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            Manage your dynamic QR code and profile options below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Display */}
          <div>
            <QRCodeDisplay 
              qrId={user?.qrId || ''} 
              activeOption={activeOption}
            />
          </div>

          {/* Profile Manager */}
          <div>
            <ProfileManager
              profileOptions={profileOptions}
              onUpdateOptions={updateProfileOptions}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Total Options</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{profileOptions.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Active Option</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {activeOption ? activeOption.label : 'None'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">QR Code ID</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {user?.qrId?.replace(/^qr_/, '').slice(-6) || 'N/A'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;