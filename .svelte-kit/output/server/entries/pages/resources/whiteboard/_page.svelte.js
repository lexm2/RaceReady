import { o as head } from "../../../../chunks/dev.js";
//#region src/lib/pages/resources/WhiteboardPage.svelte
function WhiteboardPage($$renderer) {
	$$renderer.push(`<div class="page-container"><div class="page-header"><div class="container"><h1>Whiteboard</h1> <p class="page-subtitle">Plan race scenarios with an interactive whiteboard — place boats, marks, and committee boats,
        set wind direction, and animate race sequences.</p></div></div> <div class="stub-content"><div class="coming-soon-card"><span class="stub-icon">🖊️</span> <h2>Coming Soon</h2> <p>The interactive race whiteboard with boat placement, wind direction controls, and animation playback is in development.</p> <a class="btn-primary" href="/">Back to Home</a></div></div></div>`);
}
//#endregion
//#region src/routes/resources/whiteboard/+page.svelte
function _page($$renderer) {
	head("18lscwu", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Whiteboard — RaceReady</title>`);
		});
	});
	WhiteboardPage($$renderer, {});
}
//#endregion
export { _page as default };
