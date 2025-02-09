
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  school: string;
}

interface ProfileFormProps {
  formData: ProfileFormData;
  loading: boolean;
  onFormDataChange: (field: keyof ProfileFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ProfileForm = ({
  formData,
  loading,
  onFormDataChange,
  onSubmit,
  onCancel,
}: ProfileFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          value={formData.firstName}
          onChange={(e) => onFormDataChange('firstName', e.target.value)}
          placeholder="Enter your first name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          value={formData.lastName}
          onChange={(e) => onFormDataChange('lastName', e.target.value)}
          placeholder="Enter your last name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="school">School</Label>
        <Input
          id="school"
          value={formData.school}
          onChange={(e) => onFormDataChange('school', e.target.value)}
          placeholder="Enter your school"
        />
      </div>
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? "Updating..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};
