import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingTableRow } from '@/components/ui/loading-card';
import { ShareModal } from '@/components/ShareModal';
import { Download, Share2, Image, Calendar, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Restoration {
  id: string;
  originalName: string;
  restoredImageUrl: string | null;
  completedAt: string | null;
  status: 'completed' | 'processing' | 'failed';
  original_image_url?: string | null;
  created_at?: string | null;
}

const Restorations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedRestoration, setSelectedRestoration] = useState<Restoration | null>(null);

  // Fetch restorations from database
  const { data: restorations = [], isLoading, error } = useQuery({
    queryKey: ['restorations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('photo_restorations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform data to match interface
      return data.map(item => ({
        id: item.id,
        originalName: item.original_filename,
        restoredImageUrl: item.restored_image_url,
        completedAt: item.completed_at,
        status: (item.status === 'succeeded' || item.status === 'completed') ? 'completed' : 
                item.status === 'failed' ? 'failed' : 'processing',
        original_image_url: item.original_image_url,
        created_at: item.created_at
      })) as Restoration[];
    },
  });

  const handleDownload = async (restoration: Restoration) => {
    if (!restoration.restoredImageUrl) {
      toast({
        title: "Download failed",
        description: "No restored image available",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(restoration.restoredImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `restored_${restoration.originalName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `Downloading ${restoration.originalName}`
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the restored image",
        variant: "destructive"
      });
    }
  };

  const handleShare = (restoration: Restoration) => {
    setSelectedRestoration(restoration);
    setShareModalOpen(true);
  };

  const handleDelete = async (restoration: Restoration) => {
    if (!window.confirm(`Are you sure you want to delete ${restoration.originalName}? This cannot be undone.`)) return;
    
    const { error } = await supabase
      .from('photo_restorations')
      .delete()
      .eq('id', restoration.id);
      
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries(['restorations']);
      toast({ title: 'Deleted', description: `${restoration.originalName} deleted.` });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">
            <Trash2 className="w-3 h-3 mr-1" />
            Failed
          </Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const restorationsContent = (
    <div className="max-w-7xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Restorations</h1>
      </div>
      {/* Mobile Card/List View */}
      <div className="sm:hidden space-y-4">
        {isLoading ? (
          <Card className="shadow-soft-lg animate-pulse h-32" />
        ) : restorations.length === 0 ? (
          <EmptyState
            icon={Image}
            title="No restorations yet"
            description="Upload your first photo to get started with restoration"
            actionLabel="Start Restoring"
            onAction={() => {/* Navigate to upload */}}
            className="shadow-soft-lg"
          />
        ) : (
          restorations.map(restoration => (
            <Card key={restoration.id} className="shadow-soft-lg">
              <CardContent className="flex items-center space-x-4 py-4">
                <div className="w-16 h-16 bg-gray-100 rounded border overflow-hidden shadow-soft">
                  <img 
                    src={restoration.restoredImageUrl || restoration.original_image_url || '/placeholder.svg'} 
                    alt={restoration.originalName} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getStatusBadge(restoration.status)}
                    <span className="font-mono text-xs text-gray-500">{restoration.id}</span>
                  </div>
                  <div className="font-medium truncate text-sm">{restoration.originalName}</div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{restoration.completedAt ? new Date(restoration.completedAt).toLocaleDateString() : new Date(restoration.created_at as string).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDownload(restoration)} 
                    disabled={restoration.status !== 'completed'}
                    className="touch-target"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleShare(restoration)} 
                    disabled={restoration.status !== 'completed'}
                    className="touch-target"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(restoration)}
                    className="touch-target"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {/* Desktop Table View */}
      <div className="hidden sm:block">
        {isLoading ? (
          <Card className="shadow-soft-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Restorations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">Restoration ID</TableHead>
                      <TableHead className="font-medium">Original Filename</TableHead>
                      <TableHead className="font-medium">Completion Date</TableHead>
                      <TableHead className="font-medium text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <LoadingTableRow key={index} columns={5} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : restorations.length === 0 ? (
          <EmptyState
            icon={Image}
            title="No restorations yet"
            description="Upload your first photo to get started with restoration"
            actionLabel="Start Restoring"
            onAction={() => {/* Navigate to upload */}}
            className="shadow-soft-lg"
          />
        ) : (
          <Card className="shadow-soft-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Restorations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">Restoration ID</TableHead>
                      <TableHead className="font-medium">Original Filename</TableHead>
                      <TableHead className="font-medium">Completion Date</TableHead>
                      <TableHead className="font-medium text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restorations.map(restoration => (
                      <TableRow key={restoration.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell>
                          {getStatusBadge(restoration.status)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {restoration.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded border overflow-hidden shadow-soft">
                              <img 
                                src={restoration.restoredImageUrl || restoration.original_image_url || '/placeholder.svg'} 
                                alt={restoration.originalName} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <span className="font-medium truncate max-w-xs">
                              {restoration.originalName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{restoration.completedAt ? new Date(restoration.completedAt).toLocaleDateString() : new Date(restoration.created_at as string).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDownload(restoration)} 
                              disabled={restoration.status !== 'completed'}
                              className="touch-target"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleShare(restoration)} 
                              disabled={restoration.status !== 'completed'}
                              className="touch-target"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(restoration)}
                              className="touch-target"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedRestoration && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          restoration={selectedRestoration}
        />
      )}
    </div>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <Header variant="dashboard" />
          <div className="flex-1 p-8">
            {restorationsContent}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Restorations;
