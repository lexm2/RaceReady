import { o as head } from "../../../../chunks/dev.js";
//#region src/lib/pages/study/RacingRulesPage.svelte
function RacingRulesPage($$renderer) {
	$$renderer.push(`<div class="page-container"><div class="page-header"><div class="container"><h1>Racing Rules</h1> <p class="page-subtitle">Learn the ISAF Racing Rules of Sailing 2025–2028 through interactive scenarios
        and multiple-choice questions at your own level.</p></div></div> <div class="stub-content"><div class="coming-soon-card"><span class="stub-icon">⚖️</span> <h2>Coming Soon</h2> <p>Interactive rule scenarios with beginner, intermediate, and advanced levels are on the way.</p> <a class="btn-primary" href="/">Back to Home</a></div></div></div>`);
}
//#endregion
//#region src/routes/study/racing-rules/+page.svelte
function _page($$renderer) {
	head("1d25h5j", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Racing Rules — RaceReady</title>`);
		});
	});
	RacingRulesPage($$renderer, {});
}
//#endregion
export { _page as default };
