/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ONESIGNAL_APP_ID?: string
  readonly VITE_ONESIGNAL_REST_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
