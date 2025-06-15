import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, Mail, Calendar, Image, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { toast } = useToast();

  const handleUpdateProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "Please contact support to complete account deletion.",
      variant: "destructive",
    });
  };

  const profileContent = (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Profile</h1>
      
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Account Information</span>
          </CardTitle>
          <CardDescription>
            Manage your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" defaultValue="Sarah" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" defaultValue="Johnson" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="sarah.johnson@example.com" />
          </div>
          <Button onClick={handleUpdateProfile} className="bg-purple-600 hover:bg-purple-700">
            Update Profile
          </Button>
        </CardContent>
      </Card>

      {/* Usage Statistics - Simplified */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className="w-5 h-5" />
            <span>Usage Statistics</span>
          </CardTitle>
          <CardDescription>
            Track your photo restoration activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">12</div>
              <div className="text-xs sm:text-sm text-gray-600">Photos Restored</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">8</div>
              <div className="text-xs sm:text-sm text-gray-600">Downloads</div>
            </div>
            <div className="col-span-2 sm:col-span-1 text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">3</div>
              <div className="text-xs sm:text-sm text-gray-600">Days Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credits Information - Mobile Responsive */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Credits & Billing</span>
          </CardTitle>
          <CardDescription>
            Your current credits and purchase history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium">Available Credits</span>
                <Badge variant="secondary">3 remaining</Badge>
              </div>
              <div className="text-sm text-gray-600">Credits never expire</div>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy More Credits
            </Button>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>Last purchase: Never (using free credits)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>
            Manage your account settings and data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Data Button */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-900">Export Your Data</h4>
              <p className="text-sm text-gray-600">Download a copy of all your account data and restored photos</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto min-h-[48px] touch-target flex items-center justify-center space-x-3 px-6 py-3 text-base font-medium border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              <Download className="w-5 h-5" />
              <span>Export Data</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Delete Account Button */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
              <p className="text-sm text-red-600">Permanently delete your account and all associated data. This action cannot be undone.</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto min-h-[48px] touch-target flex items-center justify-center space-x-3 px-6 py-3 text-base font-medium bg-red-600 hover:bg-red-700 transition-all duration-200"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete Account</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <Header variant="dashboard" />
          <div className="flex-1 p-8">
            {profileContent}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
