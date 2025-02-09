
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

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
  return (
    <div className="mb-6 flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        <AvatarImage 
          src={avatarUrl} 
          alt="Profile" 
          className="object-cover" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
        <AvatarFallback>{firstName?.[0]}{lastName?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex items-center space-x-4">
        <Input
          type="file"
          accept="image/*"
          onChange={onAvatarUpload}
          disabled={uploadingAvatar}
          className="max-w-[200px]"
        />
        {uploadingAvatar && <span className="text-sm text-muted-foreground">Uploading...</span>}
      </div>
    </div>
  );
};
