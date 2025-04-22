
import { FormEvent } from "react";
import { NameFields } from "./NameFields";
import { EducationField } from "./EducationField";
import { FormActions } from "./FormActions";

interface FormData {
  firstName: string;
  lastName: string;
  school: string;
  avatarUrl: string;
}

interface ProfileFormProps {
  formData: FormData;
  loading: boolean;
  onFormDataChange: (field: keyof FormData, value: string) => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  onCancel: () => void;
}

export const ProfileForm = ({
  formData,
  loading,
  onFormDataChange,
  onSubmit,
  onCancel,
}: ProfileFormProps) => {
  // No hooks should be used here as they're passed as props

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NameFields
          firstName={formData.firstName}
          lastName={formData.lastName}
          onFirstNameChange={(value) => onFormDataChange("firstName", value)}
          onLastNameChange={(value) => onFormDataChange("lastName", value)}
        />
        
        <EducationField
          school={formData.school}
          onEducationChange={(value) => onFormDataChange("school", value)}
        />
      </div>
      
      <FormActions loading={loading} onCancel={onCancel} />
    </form>
  );
};
