/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
