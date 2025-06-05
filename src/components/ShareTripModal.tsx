
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShareTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  tripName: string;
}

const ShareTripModal = ({ open, onOpenChange, tripId, tripName }: ShareTripModalProps) => {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/trip/${tripId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link with your travel buddies."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Share2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Share "{tripName}"
          </DialogTitle>
          <p className="text-center text-gray-600">
            Send this link to your travel buddies so they can vote on destinations
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex space-x-2">
            <Input
              value={shareUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={handleCopy}
              variant="outline"
              className="min-w-[100px]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Or share directly:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Join our trip "${tripName}" and help choose our destination! ${shareUrl}`)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="w-full"
              >
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const emailUrl = `mailto:?subject=${encodeURIComponent(`Join our trip: ${tripName}`)}&body=${encodeURIComponent(`Help us choose our destination! ${shareUrl}`)}`;
                  window.open(emailUrl, '_blank');
                }}
                className="w-full"
              >
                Email
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareTripModal;
