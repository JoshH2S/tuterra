
import { FormField } from "./FormField";

interface NameFieldsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
}

export const NameFields = ({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
}: NameFieldsProps) => {
  return (
    <>
      <FormField
        id="firstName"
        label="First Name"
        value={firstName}
        placeholder="Enter your first name"
        onChange={onFirstNameChange}
      />
      <FormField
        id="lastName"
        label="Last Name"
        value={lastName}
        placeholder="Enter your last name"
        onChange={onLastNameChange}
      />
    </>
  );
};
