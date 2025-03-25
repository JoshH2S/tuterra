
export const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  let score = 0;
  
  // Length
  score += Math.min(password.length * 4, 25);
  
  // Character variety
  if (/[A-Z]/.test(password)) score += 15;
  if (/[a-z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
  
  // Complexity
  const uniqueChars = new Set(password).size;
  score += uniqueChars * 2;
  
  // Penalize repetitive characters
  if (/(.)\1{2,}/.test(password)) score -= 10;
  
  return Math.min(Math.max(score, 0), 100);
};

export const validatePasswordRequirements = (password: string) => {
  const requirements = [
    {
      id: 'length',
      label: 'At least 8 characters long',
      validator: (password: string) => password.length >= 8
    },
    {
      id: 'uppercase',
      label: 'Contains uppercase letter',
      validator: (password: string) => /[A-Z]/.test(password)
    },
    {
      id: 'lowercase',
      label: 'Contains lowercase letter',
      validator: (password: string) => /[a-z]/.test(password)
    },
    {
      id: 'number',
      label: 'Contains number',
      validator: (password: string) => /\d/.test(password)
    },
    {
      id: 'special',
      label: 'Contains special character',
      validator: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ];

  return {
    requirements,
    allMet: requirements.every(req => req.validator(password))
  };
};
