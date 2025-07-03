import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [autoDownload, setAutoDownload] = useState(true);
  const [fileFormat, setFileFormat] = useState('jpg');

  // Load saved settings on component mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('snaprestore-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setAutoDownload(settings.autoDownload ?? true);
        setFileFormat(settings.fileFormat ?? 'jpg');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settings = {
      autoDownload,
      fileFormat
    };
    localStorage.setItem('snaprestore-settings', JSON.stringify(settings));
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const settingsContent = (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Settings</h1>
      
      {/* Auto-Download Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Download</CardTitle>
          <CardDescription>
            Automatically download restored images when processing is complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-download"
              checked={autoDownload}
              onCheckedChange={setAutoDownload}
            />
            <Label htmlFor="auto-download">Enable auto-download</Label>
          </div>
        </CardContent>
      </Card>

      {/* File Format Settings */}
      <Card>
        <CardHeader>
          <CardTitle>File Format</CardTitle>
          <CardDescription>
            Choose the default file format for your restored images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="file-format">Default format</Label>
            <Select value={fileFormat} onValueChange={setFileFormat}>
              <SelectTrigger id="file-format" className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpg">JPEG (.jpg)</SelectItem>
                <SelectItem value="png">PNG (.png)</SelectItem>
                <SelectItem value="webp">WebP (.webp)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-purple-600 hover:bg-purple-700">
          Save Settings
        </Button>
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <Header variant="dashboard" />
          <div className="flex-1 p-8">
            {settingsContent}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
