
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/games" | "/games/regatta-run" | "/games/starboard" | "/resources" | "/resources/rulebook" | "/resources/whiteboard" | "/study" | "/study/boat-knowledge" | "/study/general" | "/study/knots" | "/study/racing-rules" | "/study/tactics";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/games": Record<string, never>;
			"/games/regatta-run": Record<string, never>;
			"/games/starboard": Record<string, never>;
			"/resources": Record<string, never>;
			"/resources/rulebook": Record<string, never>;
			"/resources/whiteboard": Record<string, never>;
			"/study": Record<string, never>;
			"/study/boat-knowledge": Record<string, never>;
			"/study/general": Record<string, never>;
			"/study/knots": Record<string, never>;
			"/study/racing-rules": Record<string, never>;
			"/study/tactics": Record<string, never>
		};
		Pathname(): "/" | "/games/regatta-run" | "/games/starboard" | "/resources/rulebook" | "/resources/whiteboard" | "/study/boat-knowledge" | "/study/general" | "/study/knots" | "/study/racing-rules" | "/study/tactics";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}