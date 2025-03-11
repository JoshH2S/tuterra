
import { FormField } from "./FormField";

interface EducationFieldProps {
  school: string;
  onEducationChange: (value: string) => void;
}

export const EducationField = ({
  school,
  onEducationChange,
}: EducationFieldProps) => {
  return (
    <FormField
      id="school"
      label="Education Level"
      value={school}
      placeholder={`Enter your ${school.toLowerCase().replace('_', ' ')}`}
      onChange={onEducationChange}
    />
  );
};
