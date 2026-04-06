import { c as stringify, i as derived, n as attr_class, o as head, z as attr } from "../../../../chunks/dev.js";
//#region src/lib/canvas/GameCanvas.svelte
function GameCanvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { scene, camera: cameraProp, animation, interactive = false, onBoatClick, onMarkClick, onBoatDrag, onMarkDrag, onBackgroundClick, class: className = "" } = $$props;
		let dpr = window.devicePixelRatio || 1;
		let canvasSize = {
			w: 0,
			h: 0
		};
		derived(() => cameraProp ?? autoFitCamera(scene.worldSize, canvasSize.w, canvasSize.h, dpr));
		function autoFitCamera(worldSize, cssW, cssH, _dpr) {
			const FILL = .88;
			if (cssW === 0 || cssH === 0) return {
				center: {
					x: worldSize.x / 2,
					y: worldSize.y / 2
				},
				zoom: 8
			};
			const physW = cssW * _dpr;
			const physH = cssH * _dpr;
			const zoom = Math.min(physW / worldSize.x, physH / worldSize.y) * FILL;
			return {
				center: {
					x: worldSize.x / 2,
					y: worldSize.y / 2
				},
				zoom
			};
		}
		$$renderer.push(`<div${attr_class(`canvas-wrapper${stringify(className ? ` ${className}` : "")}`, "svelte-1bfniti", { "interactive": interactive })}><canvas${attr("role", interactive ? "application" : "img")} aria-label="Sailing scenario diagram" class="svelte-1bfniti"></canvas></div>`);
	});
}
//#endregion
//#region src/lib/pages/games/StarboardShowdownPage.svelte
function StarboardShowdownPage($$renderer) {
	const testScene = {
		worldSize: {
			x: 200,
			y: 150
		},
		wind: {
			directionDeg: 0,
			speedKnots: 12
		},
		marks: [{
			id: "wm",
			position: {
				x: 100,
				y: 20
			},
			type: "buoy",
			side: "port",
			label: "1"
		}],
		courseLegs: [],
		boats: [{
			id: "boat-a",
			position: {
				x: 80,
				y: 90
			},
			heading: 315,
			tack: "starboard",
			speed: 6,
			hullColor: "maize",
			sailColor: "blue",
			label: "Boat A",
			isPlayer: true
		}, {
			id: "boat-b",
			position: {
				x: 120,
				y: 90
			},
			heading: 45,
			tack: "port",
			speed: 6,
			hullColor: "orange",
			sailColor: "white",
			label: "Boat B",
			isPlayer: false
		}],
		display: {
			showLabels: true,
			showWake: true,
			showWindStreaks: true,
			showCompassRose: true,
			showWindIndicator: true,
			showGrid: false
		}
	};
	$$renderer.push(`<div class="page-container"><div class="page-header"><div class="container"><h1>Starboard Showdown</h1> <p class="page-subtitle">Two boats. One scenario. Who has right of way? Fast, buzzer-style answers
        that get harder as you advance.</p></div></div> <div class="game-area svelte-1gfodvg"><div class="canvas-container svelte-1gfodvg">`);
	GameCanvas($$renderer, { scene: testScene });
	$$renderer.push(`<!----></div></div></div>`);
}
//#endregion
//#region src/routes/games/starboard/+page.svelte
function _page($$renderer) {
	head("10rux97", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Starboard Showdown — RaceReady</title>`);
		});
	});
	StarboardShowdownPage($$renderer, {});
}
//#endregion
export { _page as default };
