
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProfileOption } from '@/types/profile';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Mail, Phone } from 'lucide-react';

const RedirectPage = () => {
  const { qrId } = useParams();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [activeOption, setActiveOption] = useState<ProfileOption | null>(null);

  useEffect(() => {
    console.log('RedirectPage: QR ID received:', qrId);
    
    const checkForRedirect = () => {
      try {
        // For demo purposes, we'll use a more comprehensive localStorage approach
        // In production, this would be a backend API call
        
        // Get all stored user data
        const allStorageKeys = Object.keys(localStorage);
        console.log('RedirectPage: All localStorage keys:', allStorageKeys);
        
        let foundActiveOption = null;
        
        // Look through all localStorage entries for profile options
        for (const key of allStorageKeys) {
          if (key === 'profileOptions') {
            try {
              const profiles: ProfileOption[] = JSON.parse(localStorage.getItem(key) || '[]');
              console.log('RedirectPage: Found profiles:', profiles);
              
              const active = profiles.find(profile => profile.isActive);
              if (active) {
                console.log('RedirectPage: Found active profile:', active);
                foundActiveOption = active;
                break;
              }
            } catch (parseError) {
              console.error('RedirectPage: Error parsing profiles:', parseError);
            }
          }
        }
        
        // Also check if there's a user in localStorage that matches this QR ID
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            console.log('RedirectPage: Found user:', user);
            console.log('RedirectPage: User QR ID:', user.qrId, 'Current QR ID:', qrId);
            
            if (user.qrId === qrId && foundActiveOption) {
              console.log('RedirectPage: QR ID matches user, redirecting to:', foundActiveOption);
              setActiveOption(foundActiveOption);
              
              // Redirect after showing the option briefly
              setTimeout(() => {
                const url = formatRedirectUrl(foundActiveOption.type, foundActiveOption.value);
                console.log('RedirectPage: Redirecting to URL:', url);
                window.location.href = url;
              }, 2000);
              return;
            }
          } catch (userParseError) {
            console.error('RedirectPage: Error parsing user:', userParseError);
          }
        }
        
        console.log('RedirectPage: No active profile found, showing inactive message');
        setIsRedirecting(false);
        
      } catch (error) {
        console.error('RedirectPage: Error in checkForRedirect:', error);
        setIsRedirecting(false);
      }
    };

    checkForRedirect();
  }, [qrId]);

  const formatRedirectUrl = (type: string, value: string) => {
    switch (type) {
      case 'email': return `mailto:${value}`;
      case 'phone': return `tel:${value}`;
      case 'whatsapp': return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
      default: return value;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-8 w-8" />;
      case 'phone': return <Phone className="h-8 w-8" />;
      default: return <ExternalLink className="h-8 w-8" />;
    }
  };

  if (isRedirecting && activeOption) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="animate-pulse">
              <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                {getIcon(activeOption.type)}
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Redirecting to {activeOption.label}
              </h1>
              <p className="text-gray-600 mb-4">
                You'll be redirected automatically...
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ExternalLink className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            QR Code Not Active
          </h1>
          <p className="text-gray-600">
            This QR code doesn't have an active redirect set up yet.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            QR ID: {qrId}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RedirectPage;
