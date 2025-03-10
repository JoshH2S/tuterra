
import { ReactNode } from "react";

interface ProfileSetupHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export const ProfileSetupHeader = ({ icon, title, description }: ProfileSetupHeaderProps) => {
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <p className="text-gray-600 mb-6">{description}</p>
    </>
  );
};
