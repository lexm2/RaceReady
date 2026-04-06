import { o as head } from "../../../../chunks/dev.js";
//#region src/lib/pages/study/KnotsPage.svelte
function KnotsPage($$renderer) {
	$$renderer.push(`<div class="page-container"><div class="page-header"><div class="container"><h1>Knots</h1> <p class="page-subtitle">Learn essential sailing knots — with step-by-step diagrams and descriptions of when to use each one.</p></div></div> <div class="stub-content"><div class="coming-soon-card"><span class="stub-icon">🪢</span> <h2>Coming Soon</h2> <p>A visual knot library with tying guides and use-case descriptions is being built.</p> <a class="btn-primary" href="/">Back to Home</a></div></div></div>`);
}
//#endregion
//#region src/routes/study/knots/+page.svelte
function _page($$renderer) {
	head("1j2bjwi", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Knots — RaceReady</title>`);
		});
	});
	KnotsPage($$renderer, {});
}
//#endregion
export { _page as default };
