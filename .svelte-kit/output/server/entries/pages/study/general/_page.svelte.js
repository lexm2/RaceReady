import { o as head } from "../../../../chunks/dev.js";
//#region src/lib/pages/study/GeneralKnowledgePage.svelte
function GeneralKnowledgePage($$renderer) {
	$$renderer.push(`<div class="page-container"><div class="page-header"><div class="container"><h1>General Knowledge</h1> <p class="page-subtitle">Broaden your sailing knowledge beyond the rules — weather, seamanship, and racing fundamentals.</p></div></div> <div class="stub-content"><div class="coming-soon-card"><span class="stub-icon">📚</span> <h2>Coming Soon</h2> <p>General sailing knowledge topics and quizzes are under construction.</p> <a class="btn-primary" href="/">Back to Home</a></div></div></div>`);
}
//#endregion
//#region src/routes/study/general/+page.svelte
function _page($$renderer) {
	head("13bz27h", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>General Knowledge — RaceReady</title>`);
		});
	});
	GeneralKnowledgePage($$renderer, {});
}
//#endregion
export { _page as default };
