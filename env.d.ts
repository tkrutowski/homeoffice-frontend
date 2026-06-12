/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EC2_CONTROL_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
