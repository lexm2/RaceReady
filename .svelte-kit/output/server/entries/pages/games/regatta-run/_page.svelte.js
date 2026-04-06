import { o as head } from "../../../../chunks/dev.js";
//#region src/lib/pages/games/RegattaRunPage.svelte
function RegattaRunPage($$renderer) {
	$$renderer.push(`<div class="page-container"><div class="page-header"><div class="container"><h1>Regatta Run</h1> <p class="page-subtitle">Answer correctly to move your boat forward. Wrong answers let the competition
        overtake you. Finish the race by finishing the session.</p></div></div> <div class="stub-content"><div class="coming-soon-card"><span class="stub-icon">🏆</span> <h2>Coming Soon</h2> <p>The race-format quiz game with customizable topic selection and real-time boat movement is coming soon.</p> <a class="btn-primary" href="/">Back to Home</a></div></div></div>`);
}
//#endregion
//#region src/routes/games/regatta-run/+page.svelte
function _page($$renderer) {
	head("1hvssr7", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Regatta Run — RaceReady</title>`);
		});
	});
	RegattaRunPage($$renderer, {});
}
//#endregion
export { _page as default };
