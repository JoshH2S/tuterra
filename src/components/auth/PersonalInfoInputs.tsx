
import { User, AtSign } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PersonalInfoInputsProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
}

export const PersonalInfoInputs = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
}: PersonalInfoInputsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="First Name"
            className="pl-10"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Last Name"
            className="pl-10"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="relative">
        <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="email"
          placeholder="Email address"
          className="pl-10"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
    </>
  );
};
