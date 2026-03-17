import { User, AtSign } from "lucide-react";

const glassInputClass =
  "flex h-11 w-full rounded-full border bg-white/10 border-white/15 px-4 py-2 pl-10 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ac9571]/50 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            placeholder="First Name"
            className={glassInputClass}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            placeholder="Last Name"
            className={glassInputClass}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="relative">
        <AtSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="email"
          placeholder="Email address"
          className={glassInputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
    </>
  );
};
