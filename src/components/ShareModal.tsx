
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Copy, Mail, MessageCircle, Share2, Eye, Clock, Download, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restoration: {
    id: string;
    originalName: string;
    restoredImageUrl: string;
  };
}

export function ShareModal({ open, onOpenChange, restoration }: ShareModalProps) {
  const { toast } = useToast();
  const [shareSettings, setShareSettings] = useState({
    allowDownload: true,
    expiresIn: '7days',
    password: ''
  });

  const shareUrl = `https://snaprestore.app/shared/${restoration.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share link has been copied to your clipboard"
    });
  };

  const handleEmailShare = () => {
    const subject = `Check out my restored photo: ${restoration.originalName}`;
    const body = `I've restored this old photo using SnapRestore! Take a look: ${shareUrl}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleSocialShare = (platform: string) => {
    const text = `Check out my restored photo: ${restoration.originalName}`;
    const url = shareUrl;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5" />
            <span>Share Restored Photo</span>
          </DialogTitle>
          <DialogDescription>
            Share your beautifully restored photo with friends and family
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Card */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded border overflow-hidden shadow-soft">
                  <img 
                    src={restoration.restoredImageUrl} 
                    alt={restoration.originalName} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm">
                    {restoration.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Restored with SnapRestore
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Link */}
          <div className="space-y-2">
            <Label htmlFor="share-link" className="text-sm font-medium">Share Link</Label>
            <div className="flex space-x-2">
              <Input
                id="share-link"
                value={shareUrl}
                readOnly
                className="flex-1 text-sm"
              />
            </div>
          </div>

          {/* Share Settings - Compact */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Allow download</span>
              </div>
              <Switch
                checked={shareSettings.allowDownload}
                onCheckedChange={(checked) => 
                  setShareSettings(prev => ({ ...prev, allowDownload: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Link expires in 7 days</span>
              </div>
              <Eye className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Primary and Secondary Actions */}
          <div className="flex space-x-2 pt-2">
            <Button 
              onClick={handleCopyLink} 
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="flex-shrink-0">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleEmailShare}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSocialShare('whatsapp')}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Facebook
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
