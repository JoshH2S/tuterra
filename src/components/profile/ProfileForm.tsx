
import { NameFields } from "./NameFields";
import { EducationField } from "./EducationField";
import { FormActions } from "./FormActions";

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
  // Function to handle field changes
  const handleFieldChange = (field: keyof ProfileFormData) => (value: string) => {
    onFormDataChange(field, value);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <NameFields 
        firstName={formData.firstName}
        lastName={formData.lastName}
        onFirstNameChange={handleFieldChange('firstName')}
        onLastNameChange={handleFieldChange('lastName')}
      />
      <EducationField 
        school={formData.school}
        onEducationChange={handleFieldChange('school')}
      />
      <FormActions 
        loading={loading} 
        onCancel={onCancel} 
      />
    </form>
  );
};
