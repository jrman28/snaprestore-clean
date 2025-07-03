import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, Mail, Calendar, Image, Download, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
}

interface UserStats {
  photosRestored: number;
  downloads: number;
  daysActive: number;
  credits: number;
  lastPurchase: string | null;
}

const Profile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // Fetch user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error('No user found');

      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      return {
        id: user.id,
        email: user.email || '',
        full_name: profile?.full_name || user.user_metadata?.full_name || '',
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || '',
        created_at: user.created_at
      } as UserProfile;
    }
  });

  // Fetch user statistics with real-time updates
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    refetchInterval: 5000, // Refetch every 5 seconds to keep credits updated
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Get restoration count
      const { data: restorations, error: restoreError } = await supabase
        .from('photo_restorations')
        .select('id, created_at, status')
        .eq('user_id', user.id);

      if (restoreError) throw restoreError;

      // Get credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      if (creditsError && creditsError.code !== 'PGRST116') {
        // If no credits record exists, create one with default credits
        const { error: insertError } = await supabase
          .from('user_credits')
          .insert({ user_id: user.id, credits: 1 }); // Start with 1 free credit

        if (insertError) throw insertError;
      }

      // Get payment history
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('created_at, status')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (paymentsError) throw paymentsError;

      // Calculate stats
      const photosRestored = restorations?.filter(r => r.status === 'completed').length || 0;
      const downloads = photosRestored; // Assume 1 download per completed restoration
      
      // Calculate days active (days since first restoration or account creation)
      const firstRestoration = restorations?.length > 0 
        ? new Date(restorations[restorations.length - 1].created_at)
        : new Date(user.created_at);
      const daysActive = Math.max(1, Math.ceil((Date.now() - firstRestoration.getTime()) / (1000 * 60 * 60 * 24)));

      const credits = creditsData?.credits || 1; // Default to 1 free credit
      const lastPurchase = payments?.[0]?.created_at || null;

      return {
        photosRestored,
        downloads,
        daysActive,
        credits,
        lastPurchase
      } as UserStats;
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { full_name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.full_name,
          email: user.email,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Set form values when user data loads
  useEffect(() => {
    if (user) {
      const nameParts = user.full_name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    updateProfileMutation.mutate({ full_name: fullName });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "Please contact support to complete account deletion.",
      variant: "destructive",
    });
  };

  if (userLoading || statsLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <Header variant="dashboard" />
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Loading profile...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

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
              <Input 
                id="first-name" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input 
                id="last-name" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>
          <Button 
            onClick={handleUpdateProfile} 
            className="bg-purple-600 hover:bg-purple-700"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Profile'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
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
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {stats?.photosRestored || 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Photos Restored</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {stats?.downloads || 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Downloads</div>
            </div>
            <div className="col-span-2 sm:col-span-1 text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {stats?.daysActive || 1}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Days Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credits Information */}
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
                <Badge variant="secondary">
                  {stats?.credits || 1} remaining
                </Badge>
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
              <span>
                Last purchase: {
                  stats?.lastPurchase 
                    ? new Date(stats.lastPurchase).toLocaleDateString()
                    : 'Never (using free credits)'
                }
              </span>
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
