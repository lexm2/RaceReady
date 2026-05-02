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
      <div class="finish-card">
        <h2>Final Score</h2>
        <p class="big-score">{score.correct} / {score.total}</p>
        <button class="btn primary" onclick={restart}>Play Again</button>
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
              {dominant.ruleId.replace('rule_', 'Rule ')}: {dominant.description}
            </span>
          {:else}
            <span class="rule-indicator severity-none">No rule active</span>
          {/if}
        </div>
      </div>

      <div class="question">{current.questionText}</div>

      <div class="canvas-container">
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
        <div class="result {phase}">
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
          <button class="btn primary" onclick={nextScenario}>
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
    background: var(--color-blue-dark, #00274C);
    color: white;
    padding: 4px 10px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.875rem;
  }

  .score {
    font-weight: 600;
    color: var(--color-text-muted, #555);
  }

  .rule-indicator {
    font-size: 0.85rem;
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: 500;
  }
  .rule-indicator.severity-none      { background: rgba(0,0,0,0.06); color: #555; }
  .rule-indicator.severity-advisory  { background: rgba(255,203,5,0.18); color: #6b4f00; }
  .rule-indicator.severity-warning   { background: rgba(255,140,0,0.20); color: #863f00; }
  .rule-indicator.severity-violation { background: rgba(239,68,68,0.20); color: #7a1010; }

  .question {
    font-size: 1.125rem;
    font-weight: 500;
    text-align: center;
  }

  .canvas-container {
    width: 100%;
    height: 480px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-card);
  }

  .result {
    padding: var(--space-4);
    border-radius: var(--radius-md);
    border-left: 4px solid;
  }
  .result.correct { background: rgba(34,197,94,0.10); border-color: #22c55e; }
  .result.wrong   { background: rgba(239,68,68,0.10); border-color: #ef4444; }
  .result h3 { margin-top: 0; }

  .rule-details {
    margin-top: var(--space-3);
    padding: var(--space-3);
    background: white;
    border-radius: var(--radius-sm);
  }
  .rule-details summary { cursor: pointer; font-weight: 600; }
  .rule-md { margin-top: var(--space-2); }

  .rule-loading { font-style: italic; color: var(--color-text-muted, #777); }

  .btn {
    margin-top: var(--space-3);
    padding: 10px 20px;
    border-radius: var(--radius-sm);
    border: none;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
  }
  .btn.primary {
    background: var(--color-blue-dark, #00274C);
    color: white;
  }
  .btn.primary:hover { opacity: 0.9; }

  .finish-card {
    text-align: center;
    padding: var(--space-6);
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
  }
  .big-score {
    font-size: 3rem;
    font-weight: 700;
    color: var(--color-blue-dark, #00274C);
    margin: var(--space-3) 0;
  }
</style>
