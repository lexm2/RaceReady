import { o as head } from "../../../../chunks/dev.js";
//#region src/lib/pages/study/BoatKnowledgePage.svelte
function BoatKnowledgePage($$renderer) {
	$$renderer.push(`<div class="page-container"><div class="page-header"><div class="container"><h1>Boat Knowledge &amp; Handling</h1> <p class="page-subtitle">Master every part of your boat — from the rig to the hull — and learn how to trim
        for every condition.</p></div></div> <div class="stub-content"><div class="coming-soon-card"><span class="stub-icon">⛵</span> <h2>Coming Soon</h2> <p>Interactive boat diagrams, rapid-fire labeling quizzes, and trim guides by conditions are coming.</p> <a class="btn-primary" href="/">Back to Home</a></div></div></div>`);
}
//#endregion
//#region src/routes/study/boat-knowledge/+page.svelte
function _page($$renderer) {
	head("rs8pti", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Boat Knowledge — RaceReady</title>`);
		});
	});
	BoatKnowledgePage($$renderer, {});
}
//#endregion
export { _page as default };
