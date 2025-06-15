
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Share2, CheckCircle } from 'lucide-react';
import { ShareModal } from '@/components/ShareModal';

interface SuccessResultProps {
  restoredImage: string;
  onDownload: () => void;
  onShare?: () => void;
  restoration?: {
    id: string;
    originalName: string;
    restoredImageUrl: string;
  };
}

export function SuccessResult({ restoredImage, onDownload, restoration }: SuccessResultProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShareClick = () => {
    // Always open the ShareModal with proper restoration data
    const restorationData = restoration || {
      id: `RST-${Date.now()}`,
      originalName: 'restored_image.jpg',
      restoredImageUrl: restoredImage
    };
    
    setIsShareModalOpen(true);
  };

  return (
    <>
      <Card className="p-4 sm:p-6 max-w-2xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center space-x-2 text-green-600 mb-4">
          <CheckCircle size={20} className="sm:w-6 sm:h-6" />
          <h3 className="text-lg sm:text-xl font-semibold">Restoration Complete</h3>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Completed on {new Date().toLocaleDateString()}</span>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
          <Button 
            onClick={onDownload} 
            className="bg-purple-600 hover:bg-purple-700 flex-1 py-3 text-sm sm:text-base"
          >
            <Download size={16} className="mr-2" />
            Download Restored Image
          </Button>
          <Button 
            onClick={handleShareClick} 
            variant="outline" 
            className="flex-1 py-3 text-sm sm:text-base"
          >
            <Share2 size={16} className="mr-2" />
            Share Result
          </Button>
        </div>

        <div className="border-t pt-4 sm:pt-6">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Restoration Details</h4>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
            <li>• Enhanced image clarity and sharpness</li>
            <li>• Reduced noise and artifacts</li>
            <li>• Improved color balance and contrast</li>
            <li>• Preserved original image dimensions</li>
          </ul>
        </div>
      </Card>

      <ShareModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        restoration={restoration || {
          id: `RST-${Date.now()}`,
          originalName: 'restored_image.jpg',
          restoredImageUrl: restoredImage
        }}
      />
    </>
  );
}
