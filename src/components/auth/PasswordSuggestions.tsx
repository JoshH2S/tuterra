
import { useState, useEffect } from 'react';
import { RefreshCw, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from '@/hooks/use-toast';

const generatePassword = () => {
  const length = 16;
  const charset = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  let password = '';
  // Ensure at least one character from each set
  password += charset.uppercase.charAt(Math.floor(Math.random() * charset.uppercase.length));
  password += charset.lowercase.charAt(Math.floor(Math.random() * charset.lowercase.length));
  password += charset.numbers.charAt(Math.floor(Math.random() * charset.numbers.length));
  password += charset.symbols.charAt(Math.floor(Math.random() * charset.symbols.length));

  // Fill the rest randomly
  const allChars = Object.values(charset).join('');
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export const PasswordSuggestions = ({ 
  onSelect 
}: { 
  onSelect: (password: string) => void 
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateSuggestions = () => {
    setSuggestions([
      generatePassword(),
      generatePassword(),
      generatePassword()
    ]);
  };

  const copyToClipboard = (password: string) => {
    navigator.clipboard.writeText(password)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Password copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy password",
          variant: "destructive",
        });
      });
  };

  useEffect(() => {
    generateSuggestions();
  }, []);

  return (
    <div className="space-y-3 mt-4 mb-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Suggested Strong Passwords</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateSuggestions}
          className="h-8 px-2"
          type="button"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Generate new passwords</span>
        </Button>
      </div>
      
      <div className="space-y-2">
        {suggestions.map((password, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-md bg-muted overflow-auto touch-manipulation"
          >
            <code className="text-sm font-mono">{password}</code>
            <div className="flex gap-2 ml-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => onSelect(password)}
                type="button"
              >
                Use
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => copyToClipboard(password)}
                type="button"
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy password</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
