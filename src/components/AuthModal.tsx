import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Github, Apple } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [showMagicLink, setShowMagicLink] = useState(false);

  const handleMagicLinkSend = async () => {
    if (!email) return;
    setShowMagicLink(true);
    // Send magic link using Supabase, redirect to /dashboard
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) {
      // Show error to user (could use toast or inline message)
      alert('Error sending magic link: ' + error.message);
      setShowMagicLink(false);
    }
    // If no error, show the "Check your email" message
  };

  const handleOAuthProvider = async (provider: string) => {
    // Sign in with OAuth, redirect to /dashboard
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) {
      alert('Error with OAuth: ' + error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Get Started
          </DialogTitle>
          <p className="text-center text-gray-600">
            Sign in or create your account to start restoring photos
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-4">
            {/* Primary OAuth Options */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full h-12 text-base hover:bg-gray-50 border-gray-200"
                onClick={() => handleOAuthProvider('google')}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 text-base hover:bg-gray-50 border-gray-200"
                onClick={() => handleOAuthProvider('github')}
              >
                {/* Custom GitHub SVG */}
                <svg className="w-5 h-5 mr-3" viewBox="0 0 768 768" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M384 64C192 64 64 192 64 384c0 141.6 91.2 261.6 216.8 304 16 3.2 21.6-6.4 21.6-14.4 0-7.2 0-30.4 0-56-88 19.2-106.4-41.6-106.4-41.6-14.4-36.8-35.2-46.4-35.2-46.4-28.8-20 2.4-20 2.4-20 32 2.4 48.8 32.8 48.8 32.8 28 48.8 73.6 34.8 91.6 26.4 2.8-20.4 10.9-34.8 19.8-42.8-70.4-8-144.4-35.2-144.4-156.8 0-34.8 12.4-63.2 32.8-85.6-3.2-8-14.4-40.8 3.2-85.6 0 0 26.4-8.4 86.4 32.8 25.2-7.2 52-10.8 78.8-10.8s53.6 3.6 78.8 10.8c60-41.2 86.4-32.8 86.4-32.8 17.6 44.8 6.4 77.6 3.2 85.6 20.4 22.4 32.8 50.8 32.8 85.6 0 121.6-74 148.8-144.8 156.8 11.2 9.6 20.8 28.8 20.8 58.4 0 42.4 0 76.8 0 87.2 0 8 5.6 17.6 21.6 14.4C612.8 645.6 704 525.6 704 384 704 192 576 64 384 64z" fill="#000000"></path>
                  </g>
                </svg>
                Continue with GitHub
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full h-12 text-base hover:bg-gray-50 border-gray-200"
                onClick={() => handleOAuthProvider('apple')}
              >
                {/* Custom Apple SVG */}
                <svg className="w-5 h-5 mr-3" viewBox="0 0 768 768" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M624.8 576.8c-8.8 20-18.4 38.4-28.8 54.4-15.2 23.2-27.6 39.2-37.6 48.8-15.2 14.4-31.6 21.6-49.2 21.6-12.8 0-28.4-3.6-46.4-10.8-18-7.2-34.4-10.8-49.2-10.8-15.2 0-31.6 3.6-49.2 10.8-17.6 7.2-33.2 10.8-46.4 10.8-17.6 0-34-7.2-49.2-21.6-10.4-9.6-22.8-25.6-37.6-48.8-10.4-16-20-34.4-28.8-54.4-9.6-22.4-17.2-46.8-22.8-73.6-6-28.8-9.2-56.4-9.2-82.4 0-30.4 6.8-56.8 20.4-79.2 10.8-17.2 25.2-30.8 43.2-40.8 18-10 37.6-15.2 58.8-15.2 11.2 0 26.4 3.6 45.2 10.8 18.8 7.2 31.2 10.8 36.8 10.8 4.8 0 18.8-3.6 41.2-10.8 22-7.2 40.4-10.8 55.2-10.8 20.8 0 40.4 5.2 58.4 15.2 18 10 32.4 23.6 43.2 40.8 13.6 22.4 20.4 48.8 20.4 79.2 0 26-3.2 53.6-9.2 82.4-5.6 26.8-13.2 51.2-22.8 73.6zM496.8 144c0 16.8-6.4 33.2-19.2 49.2-15.6 18.8-34.4 29.6-55.2 27.6-0.4-2.4-0.4-5.2-0.4-8.4 0-16.4 7.2-33.6 20.4-48.8 6.8-8 15.6-15.2 26.4-21.2 10.8-6 21.2-9.6 31.2-10.8 0.4 2.8 0.8 5.6 0.8 8.4z" fill="#000000"></path>
                  </g>
                </svg>
                Continue with Apple
              </Button>
            </div>
            
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-2 text-sm text-gray-500">or</span>
              </div>
            </div>
            
            {/* Magic Link Section */}
            {!showMagicLink ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                  />
                </div>
                
                <Button 
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700"
                  onClick={handleMagicLinkSend}
                  disabled={!email}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Continue with Email
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-3 py-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg">Check your email</h3>
                <p className="text-gray-600 text-sm">
                  We've sent a magic link to <strong>{email}</strong>
                </p>
                <p className="text-gray-500 text-xs">
                  Click the link in your email to continue
                </p>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowMagicLink(false)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  Use a different email
                </Button>
              </div>
            )}
            
            <div className="text-center text-xs text-gray-500 pt-4">
              <p>Your photos are private, secure, and never shared</p>
              <p className="mt-1">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
