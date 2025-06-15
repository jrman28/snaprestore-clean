import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PhotoUploadProps {
  onImageSelect: (file: File, imageUrl: string) => void;
  selectedFile: File | null;
  imagePreview: string | null;
}

export function PhotoUpload({ onImageSelect, selectedFile, imagePreview }: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
      return false;
    }

    if (file.size > maxSize) {
      setError('Image size should be less than 10MB');
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsLoading(true);
    setError(null);

    try {
      const imageUrl = URL.createObjectURL(file);
      onImageSelect(file, imageUrl);
    } catch (err) {
      setError('Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onImageSelect]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleReplaceImage = () => {
    const input = document.getElementById('photo-upload') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  const handleRemoveImage = () => {
    setError(null);
    onImageSelect(null as any, null as any);
  };

  if (imagePreview) {
    return (
      <Card className="max-w-2xl mx-auto p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative" role="region" aria-label="Selected image preview">
          <img
            src={imagePreview}
            alt="Selected photo"
            className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg"
            loading="lazy"
            onError={() => setError('Failed to load image')}
          />
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              onClick={handleReplaceImage}
              variant="secondary"
              size="sm"
              className="bg-white/90 hover:bg-white text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              disabled={isLoading}
              aria-label="Replace current image"
            >
              <Upload size={14} className="mr-1" aria-hidden="true" />
              <span>Replace</span>
            </Button>
            <Button
              onClick={handleRemoveImage}
              variant="secondary"
              size="sm"
              className="bg-white/90 hover:bg-white focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              disabled={isLoading}
              aria-label="Remove current image"
            >
              <X size={14} aria-hidden="true" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-4" role="alert">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg" role="status">
          <p className="text-green-800 font-medium text-sm sm:text-base truncate">
            {selectedFile?.name}
          </p>
          <p className="text-green-600 text-xs sm:text-sm">
            Ready to restore! Click the restore button below.
          </p>
        </div>

        <input
          type="file"
          id="photo-upload"
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isLoading}
          aria-label="Upload new image"
        />
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto p-6 sm:p-8 lg:p-12 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 sm:p-8 lg:p-12 text-center transition-colors
          ${dragActive ? 'border-purple-400 bg-purple-50' : 'border-gray-300'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        role="region"
        aria-label="Image upload area"
        aria-describedby="upload-instructions"
      >
        <div className="flex flex-col items-center space-y-4 lg:space-y-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-lg flex items-center justify-center">
            <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" aria-hidden="true" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Upload Your Photo
            </h3>
            <p id="upload-instructions" className="text-sm sm:text-base text-gray-600 max-w-md px-4">
              Drag and drop your image here, or click to browse. We'll restore it to its former glory.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="w-full max-w-md" role="alert">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <input
            type="file"
            id="photo-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isLoading}
            aria-label="Choose image file"
          />
          
          <Button 
            asChild
            className="bg-purple-600 hover:bg-purple-700 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            disabled={isLoading}
          >
            <label htmlFor="photo-upload" className="cursor-pointer flex items-center space-x-2">
              <Upload size={16} aria-hidden="true" />
              <span>{isLoading ? 'Uploading...' : 'Choose Image'}</span>
            </label>
          </Button>

          <p className="text-xs sm:text-sm text-gray-500">
            Supports JPG, PNG, and other common image formats
          </p>
        </div>
      </div>
    </Card>
  );
}
