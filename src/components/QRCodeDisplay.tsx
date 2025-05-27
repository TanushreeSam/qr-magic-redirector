
import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeDisplayProps {
  qrId: string;
  activeOption?: { label: string; value: string; type: string };
}

const QRCodeDisplay = ({ qrId, activeOption }: QRCodeDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // This URL would be your app's domain in production
  const qrUrl = `${window.location.origin}/redirect/${qrId}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) console.error('QR Code generation error:', error);
      });
    }
  }, [qrUrl]);

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `qr-code-${qrId}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
      
      toast({
        title: "QR Code downloaded",
        description: "Your QR code has been saved to your device.",
      });
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(qrUrl);
    toast({
      title: "URL copied",
      description: "QR code URL has been copied to clipboard.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Dynamic QR Code</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border rounded-lg shadow-sm"
          />
        </div>
        
        {activeOption ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>Currently redirects to:</strong> {activeOption.label}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {activeOption.type}: {activeOption.value}
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              No active profile selected. Add a profile option and set it as active.
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button onClick={downloadQR} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={copyUrl} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copy URL
          </Button>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p><strong>QR ID:</strong> {qrId}</p>
          <p><strong>URL:</strong> {qrUrl}</p>
          <p className="mt-2">This QR code will always redirect based on your active profile selection.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
