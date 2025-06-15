
import React, { useState } from 'react';
import { Home, RotateCcw, ShoppingCart, MessageCircle } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { useLocation, Link } from 'react-router-dom';
import { SupportModal } from '@/components/SupportModal';

const menuItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "My Restorations", 
    url: "/restorations",
    icon: RotateCcw,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  return (
    <>
      <Sidebar className="border-r shadow-soft">
        <SidebarHeader className="p-6">
          <Logo />
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
                      className="touch-target hover:bg-gray-50 transition-colors"
                    >
                      <Link to={item.url} className="flex items-center space-x-3">
                        <item.icon size={20} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => setIsSupportModalOpen(true)}
                    className="flex items-center space-x-3 cursor-pointer touch-target hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle size={20} />
                    <span>Support</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <Button className="w-full bg-purple-600 hover:bg-purple-700 shadow-soft touch-target transition-all duration-200">
            <ShoppingCart size={16} className="mr-2" />
            Buy Credits
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SupportModal 
        open={isSupportModalOpen} 
        onOpenChange={setIsSupportModalOpen} 
      />
    </>
  );
}
