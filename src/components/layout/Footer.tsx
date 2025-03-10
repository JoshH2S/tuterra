
import { PrivacyPolicyLink } from "@/components/legal/PrivacyPolicyLink";

export const Footer = () => {
  return (
    <footer className="w-full py-4 px-4 border-t mt-auto">
      <div className="container mx-auto flex justify-center sm:justify-between items-center flex-wrap">
        <div className="text-xs text-gray-500 text-center sm:text-left mb-2 sm:mb-0">
          © {new Date().getFullYear()} EduPortal. All rights reserved.
        </div>
        <div className="text-xs text-gray-500 flex gap-4 items-center">
          <PrivacyPolicyLink className="text-xs text-gray-500 hover:text-gray-800" />
          <span className="text-gray-300">|</span>
          <span className="hover:text-gray-800 cursor-pointer">Terms of Service</span>
          <span className="text-gray-300">|</span>
          <span className="hover:text-gray-800 cursor-pointer">Help</span>
        </div>
      </div>
    </footer>
  );
};
