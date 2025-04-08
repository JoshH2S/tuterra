
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileAvatarProps {
  firstName: string;
  lastName: string;
  avatarUrl: string;
  uploadingAvatar: boolean;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileAvatar = ({
  firstName,
  lastName,
  avatarUrl,
  uploadingAvatar,
  onAvatarUpload,
}: ProfileAvatarProps) => {
  const isMobile = useIsMobile();
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  
  return (
    <div className="mb-6 flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className={`${isMobile ? "h-20 w-20" : "h-24 w-24"} border-2 border-primary/10`}>
          <AvatarImage 
            src={avatarUrl} 
            alt="Profile" 
            className="object-cover" 
          />
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            {initials || "?"}
          </AvatarFallback>
        </Avatar>
        
        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full cursor-pointer 
          shadow-md hover:bg-primary/90 transition-colors group-hover:scale-110">
          <Camera className="h-4 w-4" />
          <span className="sr-only">Upload avatar</span>
        </label>
      </div>
      
      <div className="flex flex-col items-center space-y-2 w-full max-w-sm">
        <div className="relative w-full">
          <Input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={onAvatarUpload}
            disabled={uploadingAvatar}
            className={`w-full ${isMobile ? "max-w-[180px]" : "max-w-[250px]"} cursor-pointer opacity-0 absolute h-1 overflow-hidden`}
          />
          {uploadingAvatar && (
            <div className="text-sm text-center text-muted-foreground animate-pulse">
              Uploading...
            </div>
          )}
        </div>
      </div>
      
      {!isMobile && (
        <p className="text-xs text-muted-foreground">
          Click on the camera icon to upload a profile picture
        </p>
      )}
    </div>
  );
};
