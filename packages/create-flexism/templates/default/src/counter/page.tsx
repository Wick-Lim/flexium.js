import { use } from 'flexium/core'
import { css } from 'flexium/css'

export default function CounterPage() {
  const serverTimeValue = new Date().toISOString()

  return () => {
    const container = css({ maxWidth: '32rem', margin: '0 auto', padding: '4rem 1rem' })
    const title = css({ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' })
    const subtitle = css({ color: '#94a3b8', marginBottom: '2rem' })
    const card = css({ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '1rem', padding: '2rem', border: '1px solid #334155' })
    const countDisplay = css({
      fontSize: '6rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem',
      background: 'linear-gradient(to right, #60a5fa, #a855f7)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    })
    const btnRow = css({ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' })
    const btn = css({ padding: '1rem 2rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1.5rem', transition: 'background 0.2s' })
    const btnMinus = css({ background: '#dc2626', '&:hover': { background: '#b91c1c' } })
    const btnPlus = css({ background: '#16a34a', '&:hover': { background: '#15803d' } })
    const btnReset = css({ padding: '1rem 2rem', background: '#334155', borderRadius: '0.75rem', fontWeight: 500, transition: 'background 0.2s', '&:hover': { background: '#475569' } })
    const stepRow = css({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' })
    const stepLabel = css({ color: '#94a3b8' })
    const stepBtns = css({ display: 'flex', gap: '0.5rem' })
    const stepBtn = css({ padding: '0.5rem 1rem', borderRadius: '0.5rem', transition: 'all 0.2s' })
    const stepActive = css({ background: '#2563eb', color: '#fff' })
    const stepInactive = css({ background: '#334155', color: '#94a3b8', '&:hover': { background: '#475569' } })
    const serverTime = css({ marginTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' })

    const [count, setCount] = use(0)
    const [step, setStep] = use(1)

    return (
      <div class={container}>
        <h1 class={title}>Counter Demo</h1>
        <p class={subtitle}>Interactive counter with reactive state management</p>
        <div class={card}>
          <div class={countDisplay}>{count}</div>
          <div class={btnRow}>
            <button class={`${btn} ${btnMinus}`} onclick={() => setCount((c: number) => c - step)}>-</button>
            <button class={btnReset} onclick={() => setCount(0)}>Reset</button>
            <button class={`${btn} ${btnPlus}`} onclick={() => setCount((c: number) => c + step)}>+</button>
          </div>
          <div class={stepRow}>
            <span class={stepLabel}>Step:</span>
            <div class={stepBtns}>
              {[1, 5, 10].map((s) => (
                <button onclick={() => setStep(s)} class={`${stepBtn} ${step === s ? stepActive : stepInactive}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
        <div class={serverTime}>Server rendered at: {serverTimeValue}</div>
      </div>
    )
  }
}
