
/// <reference types="vite/client" />

// Ensure Vite environment variables are properly typed
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
