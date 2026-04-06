export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.Djybh35o.js",app:"_app/immutable/entry/app.CgKuSAax.js",imports:["_app/immutable/entry/start.Djybh35o.js","_app/immutable/chunks/BsB0QL0C.js","_app/immutable/chunks/SQMMPuzR.js","_app/immutable/entry/app.CgKuSAax.js","_app/immutable/chunks/SQMMPuzR.js","_app/immutable/chunks/BFYQcBYR.js","_app/immutable/chunks/I8rQr1kY.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/","/games/regatta-run","/games/starboard","/resources/rulebook","/resources/whiteboard","/study/boat-knowledge","/study/general","/study/knots","/study/racing-rules","/study/tactics"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
