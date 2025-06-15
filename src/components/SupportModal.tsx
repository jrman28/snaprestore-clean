
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle } from 'lucide-react';
interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function SupportModal({
  open,
  onOpenChange
}: SupportModalProps) {
  const handleEmailClick = () => {
    window.location.href = 'mailto:support@snaprestore.app';
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            <span>Contact Support</span>
          </DialogTitle>
          <DialogDescription>
            Need help with photo restoration? We're here to assist you!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-medium text-purple-900 mb-2">Email Support</h3>
            <p className="text-sm text-purple-700 mb-3">Send us an email and we'll get back to you as we can.</p>
            <Button onClick={handleEmailClick} className="w-full bg-purple-600 hover:bg-purple-700">
              <Mail className="w-4 h-4 mr-2" />
              support@snaprestore.app
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Response time: Usually within 24 hours
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}
