<script lang="ts">
  import { marked } from 'marked'
  import GameCanvas from '$lib/canvas/GameCanvas.svelte'
  import { ALL_SCENARIOS, shuffleScenarios } from '$lib/rules/scenarios.ts'
  import { evaluateScene } from '$lib/rules/logic.ts'
  import { RULES_BY_ID } from '$lib/data/rulesIndex.ts'
  import type { RuleScenario } from '$lib/rules/types.ts'
  import type { RuleViolation } from '$lib/canvas/types.ts'

  // Markdown loader (same pattern as RulebookPage)
  const ruleFiles = import.meta.glob('/rules/**/*.md', { query: '?raw', import: 'default' })

  // State
  let queue       = $state<RuleScenario[]>(shuffleScenarios())
  let index       = $state(0)
  let phase       = $state<'playing' | 'correct' | 'wrong' | 'finished'>('playing')
  let score       = $state({ correct: 0, total: 0 })
  let liveViolations = $state<RuleViolation[]>([])
  let ruleHtml    = $state('')
  let ruleLoading = $state(false)

  let current = $derived(queue[index])

  // The strongest current advisory (used for the live rule indicator)
  let dominant = $derived.by<RuleViolation | null>(() => {
    if (liveViolations.length === 0) return null
    const order = { violation: 3, warning: 2, advisory: 1 } as const
    return [...liveViolations].sort(
      (a, b) => order[b.severity] - order[a.severity],
    )[0]!
  })

  // Handlers
  function handleBoatClick(boatId: string): void {
    if (!current || phase !== 'playing') return
    if (boatId === current.answer.boatId) {
      phase = 'correct'
      score = { correct: score.correct + 1, total: score.total + 1 }
    } else {
      phase = 'wrong'
      score = { correct: score.correct, total: score.total + 1 }
    }
    loadRuleMarkdown(current.answer.ruleRef)
  }

  function handleViolationsChanged(violations: RuleViolation[]): void {
    liveViolations = violations
  }

  function nextScenario(): void {
    if (index + 1 >= queue.length) {
      phase = 'finished'
      return
    }
    index += 1
    phase = 'playing'
    ruleHtml = ''
    liveViolations = []
  }

  function restart(): void {
    queue = shuffleScenarios()
    index = 0
    score = { correct: 0, total: 0 }
    phase = 'playing'
    ruleHtml = ''
    liveViolations = []
  }

  function loadRuleMarkdown(ruleId: string): void {
    const item = RULES_BY_ID[ruleId]
    if (!item?.path) return
    const loader = ruleFiles[item.path]
    if (!loader) return
    ruleLoading = true
    loader()
      .then(md => {
        ruleHtml = marked.parse(md as string) as string
        ruleLoading = false
      })
      .catch(() => { ruleLoading = false })
  }

  // Rule evaluator passed to canvas (closure-stable reference)
  const evaluator = (scene: import('$lib/canvas/types.ts').SceneState) => evaluateScene(scene)
</script>

<div class="page-container">
  <div class="page-header">
    <div class="container">
      <h1>Starboard Showdown</h1>
      <p class="page-subtitle">
        Watch the scenario, then click the boat that must keep clear.
      </p>
    </div>
  </div>

  <div class="game-area">
    {#if phase === 'finished'}
      <div class="finish-card quiz-card">
        <h2>Final Score</h2>
        <p class="big-score">{score.correct} / {score.total}</p>
        <button class="btn-primary" onclick={restart}>Play Again</button>
      </div>
    {:else if current}
      <div class="hud">
        <div class="hud-left">
          <span class="badge">{index + 1} / {queue.length}</span>
          <span class="score">Score: {score.correct} / {score.total}</span>
        </div>
        <div class="hud-right">
          {#if dominant}
            <span class="rule-indicator severity-{dominant.severity}">
              {dominant.description}
            </span>
          {:else}
            <span class="rule-indicator severity-none">No rule active</span>
          {/if}
        </div>
      </div>

      <h2 class="question">{current.questionText}</h2>

      <div class="canvas-card quiz-card phase-{phase}">
        <GameCanvas
          scene={current.scene}
          animation={current.animation}
          interactive={phase === 'playing'}
          ruleEvaluator={evaluator}
          onViolationsChanged={handleViolationsChanged}
          onBoatClick={handleBoatClick}
        />
      </div>

      {#if phase !== 'playing'}
        <div class="result quiz-card phase-{phase}">
          <h3>{phase === 'correct' ? 'Correct!' : 'Not quite.'}</h3>
          <p>{current.answer.explanation}</p>
          {#if ruleLoading}
            <p class="rule-loading">Loading rule text...</p>
          {:else if ruleHtml}
            <details class="rule-details">
              <summary>Show {RULES_BY_ID[current.answer.ruleRef]?.title ?? current.answer.ruleRef}</summary>
              <div class="rule-md">{@html ruleHtml}</div>
            </details>
          {/if}
          <button class="btn-primary" onclick={nextScenario}>
            {index + 1 >= queue.length ? 'See Final Score' : 'Next Scenario'}
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .game-area {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    align-items: stretch;
    padding: var(--space-6) var(--space-4);
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
  }

  .hud {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .badge {
    background: var(--bg-card);
    color: var(--accent);
    border: 1px solid var(--border);
    padding: 4px 12px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.875rem;
    letter-spacing: 0.02em;
  }

  .score {
    font-weight: 600;
    color: var(--text-muted);
  }

  .rule-indicator {
    font-size: 0.85rem;
    padding: 4px 10px;
    border-radius: var(--radius-sm);
    font-weight: 500;
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text);
  }
  .rule-indicator.severity-none {
    color: var(--text-muted);
  }
  .rule-indicator.severity-advisory {
    border-color: color-mix(in srgb, var(--michigan-maize) 50%, transparent);
    color: var(--michigan-maize);
    background: color-mix(in srgb, var(--michigan-maize) 12%, var(--bg-card));
  }
  .rule-indicator.severity-warning {
    border-color: color-mix(in srgb, var(--ross-orange) 55%, transparent);
    color: var(--ross-orange);
    background: color-mix(in srgb, var(--ross-orange) 14%, var(--bg-card));
  }
  .rule-indicator.severity-violation {
    border-color: color-mix(in srgb, var(--tappan-red) 60%, transparent);
    color: color-mix(in srgb, var(--tappan-red) 60%, white);
    background: color-mix(in srgb, var(--tappan-red) 22%, var(--bg-card));
  }

  .question {
    font-family: var(--font-heading);
    font-size: var(--fs-h2, 32px);
    font-weight: var(--fw-h2, 600);
    line-height: 1.2;
    text-align: center;
    color: var(--text);
    margin: var(--space-2) 0 var(--space-3);
    letter-spacing: -0.01em;
  }

  .quiz-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    color: var(--text);
    transition: border-color var(--transition), box-shadow var(--transition);
  }
  .quiz-card:hover {
    border-color: var(--border-hover);
  }
  .quiz-card.phase-correct {
    border-color: var(--michigan-maize);
    box-shadow: var(--shadow-glow);
  }
  .quiz-card.phase-wrong {
    border-color: var(--tappan-red);
    box-shadow: 0 0 32px color-mix(in srgb, var(--tappan-red) 35%, transparent);
  }

  .canvas-card {
    width: 100%;
    height: 480px;
    overflow: hidden;
  }

  .result {
    padding: var(--space-4) var(--space-6);
  }
  .result h3 {
    font-family: var(--font-heading);
    margin: 0 0 var(--space-2);
    color: var(--text);
  }
  .result.phase-correct h3 { color: var(--michigan-maize); }
  .result.phase-wrong h3   { color: color-mix(in srgb, var(--tappan-red) 60%, white); }
  .result p { color: var(--text); }

  .rule-details {
    margin-top: var(--space-3);
    padding: var(--space-3);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
  }
  .rule-details summary {
    cursor: pointer;
    font-weight: 600;
    color: var(--accent);
  }
  .rule-md { margin-top: var(--space-2); color: var(--text); }

  .rule-loading {
    font-style: italic;
    color: var(--text-muted);
  }

  .result :global(.btn-primary) {
    margin-top: var(--space-4);
  }

  .finish-card {
    text-align: center;
    padding: var(--space-12) var(--space-6);
  }
  .finish-card h2 {
    font-family: var(--font-heading);
    font-size: var(--fs-h2, 32px);
    font-weight: var(--fw-h2, 600);
    color: var(--text);
  }
  .big-score {
    font-family: var(--font-heading);
    font-size: 3.5rem;
    font-weight: 700;
    color: var(--accent);
    margin: var(--space-3) 0;
  }
</style>
