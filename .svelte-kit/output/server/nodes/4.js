

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/games/starboard/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.D0I4CSPc.js","_app/immutable/chunks/SQMMPuzR.js","_app/immutable/chunks/I8rQr1kY.js","_app/immutable/chunks/D9ul1F0L.js"];
export const stylesheets = ["_app/immutable/assets/4.2cJxVMjd.css"];
export const fonts = [];
