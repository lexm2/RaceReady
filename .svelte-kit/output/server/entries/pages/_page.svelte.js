import { V as escape_html, a as ensure_array_like, c as stringify, i as derived, o as head, r as attr_style, z as attr } from "../../chunks/dev.js";
import { t as BurgeeLogo } from "../../chunks/BurgeeLogo.js";
//#region src/lib/components/Hero.svelte
function Hero($$renderer) {
	function stat($$renderer, value, label) {
		$$renderer.push(`<div class="stat-item svelte-1q37ri0"><span class="stat-value svelte-1q37ri0">${escape_html(value)}</span> <span class="stat-label svelte-1q37ri0">${escape_html(label)}</span></div>`);
	}
	$$renderer.push(`<section class="hero svelte-1q37ri0"><div class="hero-bg svelte-1q37ri0"><div class="hero-glow glow-1 svelte-1q37ri0"></div> <div class="hero-glow glow-2 svelte-1q37ri0"></div></div> <div class="container hero-content svelte-1q37ri0"><div class="hero-badge svelte-1q37ri0">`);
	BurgeeLogo($$renderer, { size: 18 });
	$$renderer.push(`<!----> Racing Rules of Sailing 2025–2028</div> <h1 class="hero-title svelte-1q37ri0">Master the Rules.<br class="svelte-1q37ri0"/> <span class="title-accent svelte-1q37ri0">Win the Race.</span></h1> <p class="hero-description svelte-1q37ri0">Your complete sailing race education platform. Study the rules, learn tactics,
      sharpen your boat knowledge, and test your skills with fast-paced games.</p> <div class="hero-cta svelte-1q37ri0"><a class="btn-primary cta-main svelte-1q37ri0" href="/study/racing-rules">Start Studying <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="svelte-1q37ri0"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svelte-1q37ri0"></path></svg></a> <a class="cta-secondary svelte-1q37ri0" href="/games/starboard">Play a Game</a></div> <div class="hero-stats svelte-1q37ri0">`);
	stat($$renderer, "90+", "Racing Rules");
	$$renderer.push(`<!----> <div class="stat-divider svelte-1q37ri0"></div> `);
	stat($$renderer, "5", "Study Topics");
	$$renderer.push(`<!----> <div class="stat-divider svelte-1q37ri0"></div> `);
	stat($$renderer, "2", "Race Games");
	$$renderer.push(`<!----></div></div> <div class="hero-wave svelte-1q37ri0"><svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" class="svelte-1q37ri0"><path d="M0 80V40C240 0 480 80 720 40C960 0 1200 60 1440 30V80H0Z" fill="var(--hero-wave-fill)" class="svelte-1q37ri0"></path></svg></div></section>`);
}
//#endregion
//#region src/lib/components/FeatureCard.svelte
function FeatureCard($$renderer, $$props) {
	let { icon, title, description, items, ctaLabel, ctaHref, accentColor = "maize" } = $$props;
	const colorMap = {
		maize: "var(--michigan-maize)",
		blue: "var(--arboretum-blue)",
		orange: "var(--ross-orange)",
		teal: "var(--taubman-teal)",
		red: "var(--tappan-red)",
		seafoam: "var(--michigan-maize)",
		gold: "var(--ross-orange)"
	};
	let accent = derived(() => colorMap[accentColor] ?? "var(--michigan-maize)");
	$$renderer.push(`<div class="feature-card svelte-1tvhds4"${attr_style(`--card-accent: ${stringify(accent())}`)}><div class="card-icon-wrap svelte-1tvhds4"><span class="card-icon svelte-1tvhds4">${escape_html(icon)}</span></div> <h3 class="card-title svelte-1tvhds4">${escape_html(title)}</h3> <p class="card-desc svelte-1tvhds4">${escape_html(description)}</p> <ul class="card-items svelte-1tvhds4"><!--[-->`);
	const each_array = ensure_array_like(items);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];
		$$renderer.push(`<li class="card-item svelte-1tvhds4"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="check svelte-1tvhds4"><path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg> ${escape_html(item)}</li>`);
	}
	$$renderer.push(`<!--]--></ul> <a class="card-cta svelte-1tvhds4"${attr("href", ctaHref)}>${escape_html(ctaLabel)} <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></a></div>`);
}
//#endregion
//#region src/lib/pages/HomePage.svelte
function HomePage($$renderer) {
	const studyItems = [
		"Racing Rules",
		"Tactics & Strategy",
		"Boat Knowledge",
		"General Knowledge",
		"Knots"
	];
	const resourceItems = ["Full 2025–2028 Rulebook", "Interactive Whiteboard"];
	const gameItems = ["Starboard Showdown", "Regatta Run"];
	$$renderer.push(`<div class="home svelte-ovge82">`);
	Hero($$renderer, {});
	$$renderer.push(`<!----> <section class="features-section svelte-ovge82"><div class="container"><h2 class="section-heading">Everything You Need to Race Smarter</h2> <p class="section-subheading">From beginner drills to advanced rule scenarios — RaceReady has it all.</p> <div class="feature-grid svelte-ovge82">`);
	FeatureCard($$renderer, {
		icon: "📚",
		title: "Study",
		description: "Build a solid foundation in racing rules, boat handling, and tactical decision-making across five structured topics.",
		items: studyItems,
		ctaLabel: "Start Studying",
		ctaHref: "/study/racing-rules",
		accentColor: "maize"
	});
	$$renderer.push(`<!----> `);
	FeatureCard($$renderer, {
		icon: "📖",
		title: "Resources",
		description: "Access the complete Racing Rules of Sailing with clickable references and a digital whiteboard for scenario planning.",
		items: resourceItems,
		ctaLabel: "Open Rulebook",
		ctaHref: "/resources/rulebook",
		accentColor: "blue"
	});
	$$renderer.push(`<!----> `);
	FeatureCard($$renderer, {
		icon: "🏆",
		title: "Games",
		description: "Test your knowledge under pressure. Fast-paced racing scenarios with timed responses and performance tracking.",
		items: gameItems,
		ctaLabel: "Play Now",
		ctaHref: "/games/starboard",
		accentColor: "orange"
	});
	$$renderer.push(`<!----></div></div></section> <section class="cta-section svelte-ovge82"><div class="container cta-inner svelte-ovge82"><div class="cta-content svelte-ovge82"><h2 class="cta-heading svelte-ovge82">Ready to race smarter?</h2> <p class="cta-desc svelte-ovge82">Start with the rules, sharpen your tactics, then test yourself under race pressure.</p></div> <div class="cta-buttons svelte-ovge82"><a class="btn-primary svelte-ovge82" href="/study/racing-rules">Start Learning</a> <a class="btn-ghost cta-ghost svelte-ovge82" href="/games/starboard">Try Starboard Showdown</a></div></div></section></div>`);
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer) {
	head("1uha8ag", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>RaceReady — Master the Rules. Win the Race.</title>`);
		});
	});
	HomePage($$renderer, {});
}
//#endregion
export { _page as default };
