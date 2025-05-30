// Type declarations for Deno environment
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
}

// Type declarations for Deno modules
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(url: string, key: string): any;
}

declare module "https://esm.sh/@supabase/supabase-js@2.7.1" {
  export function createClient(url: string, key: string, options?: any): any;
}

declare module "https://esm.sh/openai@3.1.0" {
  export class Configuration {
    constructor(options: { apiKey: string });
  }
  export class OpenAIApi {
    constructor(configuration: Configuration);
    createCompletion(options: any): Promise<any>;
  }
} 