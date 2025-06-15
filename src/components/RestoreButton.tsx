
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

interface RestoreButtonProps {
  onRestore: () => void;
  disabled?: boolean;
}

export function RestoreButton({ onRestore, disabled }: RestoreButtonProps) {
  return (
    <div className="mt-6 text-center">
      <Button 
        onClick={onRestore}
        disabled={disabled}
        className="bg-purple-600 hover:bg-purple-700 px-8 py-3 text-lg"
      >
        <Wand2 className="mr-2" size={20} />
        Restore Photo
      </Button>
    </div>
  );
}
