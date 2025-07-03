import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Menu, X, Home, RotateCcw, ShoppingCart, MessageCircle, HelpCircle, Sparkles, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SupportModal } from '@/components/SupportModal';
import { UserDropdown } from '@/components/UserDropdown';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface HeaderProps {
  onGetStartedClick?: () => void;
  variant?: 'default' | 'dashboard';
}

const navItems = [
  { 
    href: '/dashboard', 
    icon: Home, 
    label: 'Home' 
  },
  { 
    href: '/restorations', 
    icon: RotateCcw, 
    label: 'My Restorations' 
  },
];

export function Header({ onGetStartedClick, variant = 'default' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Initial auth state check
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Close mobile menu when auth state changes
      setIsMenuOpen(false);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Clear menu state when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleHelpClick = () => {
    setIsSupportModalOpen(true);
    setIsMenuOpen(false);
  };

  // Handle user credits with auto-creation and one-time refund
  const { data: userCredits, isLoading: creditsLoading } = useQuery({
    queryKey: ['user-credits'],
    enabled: variant === 'dashboard',
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No record exists, create one with credits
        const creditsToGive = user.id === 'fd17a733-34dc-4d26-aeb5-ab0e6fa6d924' ? 10 : 1; // Give test user 10 credits
        const { data: newRecord, error: insertError } = await supabase
          .from('user_credits')
          .insert({ user_id: user.id, credits: creditsToGive })
          .select('credits')
          .single();

        if (insertError) {
          console.error('Error creating user credits:', insertError);
          return null;
        }
        return newRecord;
      } else if (error) {
        console.error('Error fetching user credits:', error);
        return null;
      }

      // Give test user extra credits for testing
      if (user.id === 'fd17a733-34dc-4d26-aeb5-ab0e6fa6d924' && data.credits < 5) {
        const { data: updatedRecord, error: updateError } = await supabase
          .from('user_credits')
          .update({ credits: 10 })
          .eq('user_id', user.id)
          .select('credits')
          .single();

        if (!updateError && updatedRecord) {
          return updatedRecord;
        }
      }

      return data;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center space-x-4">
            {((variant === 'dashboard' && isMobile) || variant === 'default') && <Logo size="sm" />}
          </div>

          {/* Right: Credits, Avatar, Hamburger, Desktop Nav */}
          <div className="flex items-center space-x-4 ml-auto">
            {variant === 'dashboard' && user && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-purple-50 rounded-full">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  {userCredits?.credits ?? 0} credits
                </span>
              </div>
            )}
            {user && <UserDropdown />}
            {/* Desktop Navigation for authenticated users on landing page (fallback) */}
            {variant === 'default' && user && (
              <div className="hidden md:flex items-center space-x-3 ml-auto">
                <Link 
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/restorations"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  My Restorations
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-600 hover:text-gray-900 touch-target"
                  onClick={handleHelpClick}
                >
                  <HelpCircle size={18} className="mr-2" />
                  Help
                </Button>
              </div>
            )}
            {/* Desktop Navigation for unauthenticated users on landing page */}
            {variant === 'default' && !user && (
              <div className="hidden md:flex items-center space-x-4 ml-auto">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-600 hover:text-gray-900 touch-target"
                  onClick={handleHelpClick}
                >
                  <HelpCircle size={18} className="mr-2" />
                  Help
                </Button>
                {onGetStartedClick && (
                  <Button 
                    onClick={onGetStartedClick} 
                    className="bg-black hover:bg-gray-800 text-white touch-target"
                  >
                    Get Started
                  </Button>
                )}
              </div>
            )}
            {/* Hamburger menu on mobile (right side) */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="touch-target"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                <div className="relative w-5 h-5">
                  <Menu
                    size={20}
                    className={cn(
                      "absolute inset-0 transition-all duration-300",
                      isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                    )}
                  />
                  <X
                    size={20}
                    className={cn(
                      "absolute inset-0 transition-all duration-300",
                      isMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
                    )}
                  />
                </div>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay for authenticated users on landing page (fallback) */}
        {isMenuOpen && isMobile && user && variant === 'default' && (
          <div className="fixed inset-0 w-full h-full min-h-screen bg-white !bg-white opacity-100 !opacity-100 z-50 fade-in flex flex-col shadow-xl">
            <div className="flex justify-end p-4">
              <Button
                variant="ghost"
                size="icon"
                className="touch-target"
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                <X size={24} />
              </Button>
            </div>
            <div className="p-4 space-y-2 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 touch-target text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleHelpClick}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left touch-target"
              >
                <MessageCircle size={20} />
                <span className="font-medium">Support</span>
              </button>
            </div>
          </div>
        )}
        {/* Mobile Menu Overlay for authenticated users on dashboard */}
        {isMenuOpen && isMobile && user && variant === 'dashboard' && (
          <div className="fixed inset-0 w-full h-full min-h-screen bg-white !bg-white opacity-100 !opacity-100 z-50 fade-in flex flex-col shadow-xl">
            <div className="flex justify-end p-4">
              <Button
                variant="ghost"
                size="icon"
                className="touch-target"
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                <X size={24} />
              </Button>
            </div>
            <div className="p-4 space-y-2 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 touch-target",
                      isActive
                        ? "text-purple-600 bg-purple-50"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleHelpClick}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left touch-target"
              >
                <MessageCircle size={20} />
                <span className="font-medium">Support</span>
              </button>
            </div>
          </div>
        )}
        {/* Mobile Menu Overlay for unauthenticated users on landing page */}
        {isMenuOpen && isMobile && !user && variant === 'default' && (
          <div className="fixed inset-0 w-full h-full min-h-screen bg-white !bg-white opacity-100 !opacity-100 z-50 fade-in flex flex-col shadow-xl">
            <div className="flex justify-end p-4">
              <Button
                variant="ghost"
                size="icon"
                className="touch-target"
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                <X size={24} />
              </Button>
            </div>
            <div className="p-4 space-y-2 flex-1">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 touch-target text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                <Home size={20} />
                <span className="font-medium">Home</span>
              </Link>
              {/* Add more links as needed, e.g., Features, Pricing */}
              <button
                onClick={handleHelpClick}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left touch-target"
              >
                <MessageCircle size={20} />
                <span className="font-medium">Support</span>
              </button>
              {onGetStartedClick && (
                <div className="pt-2 border-t border-gray-200">
                  <Button
                    className="w-full bg-black hover:bg-gray-800 text-white touch-target flex items-center justify-center px-4 py-3 text-base font-medium"
                    onClick={() => {
                      onGetStartedClick();
                      setIsMenuOpen(false);
                    }}
                  >
                    <span>Get Started</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <SupportModal 
        open={isSupportModalOpen} 
        onOpenChange={setIsSupportModalOpen} 
      />
    </>
  );
}

export default Header;
