import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Image, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-states";

/**
 * IMPORTANT: To use the attached NYC skyline banner image:
 * 1. Save the image from your attachment as "nyc-skyline-banner.jpg"
 * 2. Place it in the public/assets/banners/ directory
 * 3. If the image isn't found, a fallback banner will be used automatically
 */

// New banner from image attachment (NYC skyline with animated character)
const NYC_SKYLINE_BANNER = "/assets/banners/nyc-skyline-banner.jpg";

// Default banners as fallbacks
const DEFAULT_BANNERS = [
  NYC_SKYLINE_BANNER, // New NYC skyline banner with animated character as default
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=300&q=80", // Finance
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=300&q=80", // Tech
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=300&q=80", // Marketing
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=300&q=80", // Consulting
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=300&q=80", // Healthcare
];

// Define the structure of internship_settings table data
interface InternshipSettings {
  id: string;
  session_id: string;
  banner_url: string | null;
  theme?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface InternshipBannerProps {
  sessionId: string;
  industry?: string;
}

// Fallback in case the image isn't found
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  console.warn("Banner image not found, using fallback");
  e.currentTarget.src = DEFAULT_BANNERS[1]; // Use the first Unsplash image as fallback
};

export function InternshipBanner({ sessionId, industry = "general" }: InternshipBannerProps) {
  const { toast } = useToast();
  const [banner, setBanner] = useState<string | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get appropriate default banner based on industry
  const getDefaultBanner = () => {
    // Always return the NYC skyline banner as default
    return NYC_SKYLINE_BANNER;
    
    // Previous industry-based logic (commented out)
    /*
    const industryLower = industry.toLowerCase();
    if (industryLower.includes("finance")) return DEFAULT_BANNERS[1];
    if (industryLower.includes("tech") || industryLower.includes("software")) return DEFAULT_BANNERS[2];
    if (industryLower.includes("market")) return DEFAULT_BANNERS[3];
    if (industryLower.includes("consult")) return DEFAULT_BANNERS[4];
    if (industryLower.includes("health") || industryLower.includes("medical")) return DEFAULT_BANNERS[5];
    return DEFAULT_BANNERS[0]; // Default to NYC skyline
    */
  };

  useEffect(() => {
    async function fetchBannerSettings() {
      try {
        // Type assertion to specify the table structure
        const { data, error } = await supabase
          .from("internship_settings")
          .select("banner_url")
          .eq("session_id", sessionId)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "not found" - we'll just use the default in that case
          console.error("Error fetching banner settings:", error);
          return;
        }

        if (data?.banner_url) {
          setBanner(data.banner_url);
          setSelectedBanner(data.banner_url);
        } else {
          // Set default banner based on industry
          const defaultBanner = getDefaultBanner();
          setBanner(defaultBanner);
          setSelectedBanner(defaultBanner);
        }
      } catch (error) {
        console.error("Error fetching banner:", error);
      }
    }

    if (sessionId) {
      fetchBannerSettings();
    }
  }, [sessionId, industry]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !sessionId) return;

    setIsUploading(true);
    try {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Banner image must be less than 2MB",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // Create a unique filename
      const fileName = `banner-${sessionId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
      
      console.log("Uploading file:", fileName);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("internship-assets")
        .upload(`banners/${fileName}`, file, {
          cacheControl: "3600",
          upsert: true, // Changed to true to replace existing files
          contentType: file.type,
        });

      if (error) {
        console.error("Storage upload error:", error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("internship-assets")
        .getPublicUrl(`banners/${fileName}`);

      console.log("File uploaded successfully, URL:", urlData.publicUrl);
      
      setSelectedBanner(urlData.publicUrl);
      
      toast({
        title: "Banner uploaded",
        description: "Click Save to apply your changes",
      });
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your banner. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const saveBannerSelection = async () => {
    if (!sessionId || !selectedBanner) return;

    setIsSaving(true);
    try {
      // Check if entry exists
      const { data: existingData, error: checkError } = await supabase
        .from("internship_settings")
        .select("id")
        .eq("session_id", sessionId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingData?.id) {
        // Update existing
        const { error } = await supabase
          .from("internship_settings")
          .update({ banner_url: selectedBanner })
          .eq("session_id", sessionId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("internship_settings")
          .insert({
            session_id: sessionId,
            banner_url: selectedBanner,
          });

        if (error) throw error;
      }

      // Update local state
      setBanner(selectedBanner);
      setIsOpen(false);
      
      toast({
        title: "Banner updated",
        description: "Your new banner has been applied",
      });
    } catch (error) {
      console.error("Error saving banner:", error);
      toast({
        title: "Save failed",
        description: "There was a problem saving your banner selection",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openDialog = () => {
    console.log("Opening banner dialog"); // Debug log
    setIsOpen(true);
  };

  const closeDialog = () => {
    console.log("Closing banner dialog"); // Debug log
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative w-full">
        {/* Banner display */}
        <div className="w-full h-[200px] rounded-xl overflow-hidden mb-4 relative group">
          {banner ? (
            <img 
              src={banner} 
              alt="Internship Banner" 
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
              <Image className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          )}
          
          {/* Fixed button with proper event handling and positioning */}
          <Button 
            variant="secondary" 
            size="default" 
            className="absolute bottom-3 right-3 z-50 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 bg-white/90 hover:bg-white text-gray-800 border backdrop-blur-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Button clicked!"); // Debug log
              openDialog();
            }}
            type="button"
            aria-label="Change banner image"
          >
            <Image className="h-4 w-4" />
            <span>Change Banner</span>
          </Button>
        </div>
      </div>

      {/* Dialog with proper portal rendering */}
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          console.log("Dialog open state changing to:", open); // Debug log
          if (!open) {
            closeDialog();
          }
        }}
      >
        <DialogContent 
          className="sm:max-w-[550px] z-[100]"
          onEscapeKeyDown={closeDialog}
          onInteractOutside={(e) => {
            e.preventDefault();
            closeDialog();
          }}
        >
          <DialogHeader>
            <DialogTitle>Customize Internship Banner</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            {/* Upload option */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Upload Custom Banner</h3>
              <div className="relative">
                <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 hover:bg-muted/50 transition-colors">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm">
                      {isUploading ? "Uploading..." : "Click to upload a banner image"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, or WebP up to 2MB
                    </p>
                  </div>
                  <input 
                    type="file"
                    accept="image/*" 
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
                {isUploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <LoadingSpinner size="default" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Preset options */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Choose from Preset Banners</h3>
              <div className="grid grid-cols-2 gap-3">
                {DEFAULT_BANNERS.map((bannerUrl, index) => (
                  <div 
                    key={index} 
                    className={`
                      relative rounded-lg overflow-hidden h-20 cursor-pointer border-2 transition-all hover:scale-105
                      ${selectedBanner === bannerUrl ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}
                    `}
                    onClick={() => setSelectedBanner(bannerUrl)}
                  >
                    <img 
                      src={bannerUrl} 
                      alt={`Banner option ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    {selectedBanner === bannerUrl && (
                      <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Preview */}
            {selectedBanner && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Preview</h3>
                <div className="rounded-lg overflow-hidden h-[120px] border">
                  <img 
                    src={selectedBanner} 
                    alt="Banner preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button 
              onClick={saveBannerSelection} 
              disabled={!selectedBanner || isSaving}
              className="min-w-[100px]"
            >
              {isSaving ? <LoadingSpinner size="small" /> : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 