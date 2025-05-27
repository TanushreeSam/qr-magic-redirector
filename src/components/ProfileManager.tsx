
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProfileOption } from '@/types/profile';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileManagerProps {
  profileOptions: ProfileOption[];
  onUpdateOptions: (options: ProfileOption[]) => void;
}

const ProfileManager = ({ profileOptions, onUpdateOptions }: ProfileManagerProps) => {
  const [newOption, setNewOption] = useState<Partial<ProfileOption>>({
    type: 'website',
    label: '',
    value: ''
  });
  const { toast } = useToast();

  const addOption = () => {
    if (!newOption.label || !newOption.value) {
      toast({
        title: "Missing information",
        description: "Please fill in both label and value fields.",
        variant: "destructive",
      });
      return;
    }

    const option: ProfileOption = {
      id: Date.now().toString(),
      type: newOption.type as ProfileOption['type'],
      label: newOption.label,
      value: newOption.value,
      isActive: profileOptions.length === 0 // First option is active by default
    };

    const updatedOptions = [...profileOptions, option];
    onUpdateOptions(updatedOptions);
    setNewOption({ type: 'website', label: '', value: '' });
    
    toast({
      title: "Profile option added",
      description: `${option.label} has been added to your profile.`,
    });
  };

  const removeOption = (id: string) => {
    const updatedOptions = profileOptions.filter(option => option.id !== id);
    onUpdateOptions(updatedOptions);
    
    toast({
      title: "Profile option removed",
      description: "The profile option has been deleted.",
    });
  };

  const setActiveOption = (id: string) => {
    const updatedOptions = profileOptions.map(option => ({
      ...option,
      isActive: option.id === id
    }));
    onUpdateOptions(updatedOptions);
    
    const activeOption = updatedOptions.find(opt => opt.id === id);
    toast({
      title: "Active profile updated",
      description: `QR code now redirects to: ${activeOption?.label}`,
    });
  };

  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'website': return 'https://example.com';
      case 'email': return 'contact@example.com';
      case 'phone': return '+1234567890';
      case 'whatsapp': return '+1234567890';
      case 'brochure': return 'https://example.com/brochure.pdf';
      default: return '';
    }
  };

  const formatValue = (type: string, value: string) => {
    switch (type) {
      case 'email': return `mailto:${value}`;
      case 'phone': return `tel:${value}`;
      case 'whatsapp': return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
      default: return value;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Manage Profile Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new option form */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium mb-4">Add New Option</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={newOption.type}
                onValueChange={(value) => setNewOption({ ...newOption, type: value as ProfileOption['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="brochure">Brochure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={newOption.label}
                onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                placeholder="e.g., My Website"
              />
            </div>
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                value={newOption.value}
                onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                placeholder={getPlaceholder(newOption.type || 'website')}
              />
            </div>
          </div>
          <Button onClick={addOption} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>

        {/* Current options */}
        <div>
          <h3 className="font-medium mb-4">Current Profile Options</h3>
          {profileOptions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No profile options yet. Add your first option above!
            </p>
          ) : (
            <div className="space-y-3">
              {profileOptions.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    option.isActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.label}</span>
                        {option.isActive && (
                          <Badge variant="default" className="bg-indigo-600">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {option.type}: {option.value}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(formatValue(option.type, option.value), '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {!option.isActive && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setActiveOption(option.id)}
                      >
                        Set Active
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeOption(option.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileManager;
