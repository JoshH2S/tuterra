
/**
 * This file contains additional type definitions for react-router-dom
 * to help with TypeScript errors when @types/react-router-dom isn't available
 */

import 'react-router-dom';

declare module 'react-router-dom' {
  export interface NavigateOptions {
    replace?: boolean;
    state?: any;
  }
  
  export interface NavigateFunction {
    (to: To, options?: NavigateOptions): void;
    (delta: number): void;
  }
  
  export type To = string | Partial<Path>;
  
  export interface Path {
    pathname: string;
    search: string;
    hash: string;
  }
  
  export function useNavigate(): NavigateFunction;
}
