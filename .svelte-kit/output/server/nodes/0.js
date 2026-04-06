

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": true,
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.AdAzwGFX.js","_app/immutable/chunks/SQMMPuzR.js","_app/immutable/chunks/I8rQr1kY.js","_app/immutable/chunks/D9ul1F0L.js","_app/immutable/chunks/bHA25ZTa.js"];
export const stylesheets = ["_app/immutable/assets/BurgeeLogo.CVZ67DbU.css","_app/immutable/assets/0.DeKrlZbi.css"];
export const fonts = [];
