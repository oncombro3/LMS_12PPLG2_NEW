/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string;
  readonly VITE_SCHOOL_NAME?: string;
  readonly VITE_PUBLIC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
