

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/study/general/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/8.9-t4ca-h.js","_app/immutable/chunks/SQMMPuzR.js","_app/immutable/chunks/I8rQr1kY.js","_app/immutable/chunks/D9ul1F0L.js"];
export const stylesheets = [];
export const fonts = [];
