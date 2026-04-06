import { o as head } from "../../../../chunks/dev.js";
//#region src/lib/pages/study/TacticsPage.svelte
function TacticsPage($$renderer) {
	$$renderer.push(`<div class="page-container"><div class="page-header"><div class="container"><h1>Tactics &amp; Strategy</h1> <p class="page-subtitle">Study race situations and learn the best tactical decisions to get ahead on the water.</p></div></div> <div class="stub-content"><div class="coming-soon-card"><span class="stub-icon">🧭</span> <h2>Coming Soon</h2> <p>Verbal and diagram-based scenarios with multiple-choice tactical decisions are in development.</p> <a class="btn-primary" href="/">Back to Home</a></div></div></div>`);
}
//#endregion
//#region src/routes/study/tactics/+page.svelte
function _page($$renderer) {
	head("s1j360", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Tactics &amp; Strategy — RaceReady</title>`);
		});
	});
	TacticsPage($$renderer, {});
}
//#endregion
export { _page as default };
