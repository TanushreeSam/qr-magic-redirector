import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProfileOption } from '@/types/profile';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Mail, Phone } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const RedirectPage = () => {
  const { qrId } = useParams();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [activeOption, setActiveOption] = useState<ProfileOption | null>(null);

  useEffect(() => {
    const checkForRedirect = async () => {
      try {
        if (!qrId) {
          console.log('RedirectPage: No QR ID provided');
          setIsRedirecting(false);
          return;
        }
        
        // Fetch the active mapping from Supabase using maybeSingle() instead of single()
        const { data: mapping, error } = await supabase
          .from('qr_mappings')
          .select('*')
          .eq('qr_id', qrId)
          .maybeSingle();

        if (error) {
          console.error('RedirectPage: Error fetching QR mapping:', error);
          setIsRedirecting(false);
          return;
        }

        if (mapping) {
          const option: ProfileOption = {
            id: mapping.id,
            type: mapping.type,
            label: mapping.label,
            value: mapping.value,
            isActive: true
          };
          
          setActiveOption(option);
          
          // Redirect after showing the option briefly
          setTimeout(() => {
            const url = formatRedirectUrl(option.type, option.value);
            console.log('RedirectPage: Redirecting to URL:', url);
            window.location.href = url;
          }, 2000);
          return;
        }
        
        console.log('RedirectPage: No active profile found for QR ID:', qrId);
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