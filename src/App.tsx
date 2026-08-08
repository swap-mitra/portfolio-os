/* SPIKE-02 token proof page — throwaway. Exists only to confirm the ported
   palette and fonts render identically to portfolio-os-mockup.html. The real
   Desktop replaces this in Phase 2/3. */

const SWATCHES = [
  ['--ink', '#0b0b16'],
  ['--ink-2', '#14142a'],
  ['--ink-3', '#1d1d3a'],
  ['--paper', '#e8e6f0'],
  ['--magenta', '#ff2e6b'],
  ['--cyan', '#23f0ff'],
  ['--yellow', '#ffe14d'],
  ['--green', '#39ff88'],
] as const

function App() {
  return (
    <div style={{ padding: 20, height: '100%', overflowY: 'auto' }}>
      <div className="pixel" style={{ fontSize: 10, color: 'var(--cyan)', letterSpacing: 2 }}>
        PORTFOLIO-OS — TOKEN PROOF
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {SWATCHES.map(([name, hex]) => (
          <div key={name} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 44,
                background: `var(${name})`,
                border: '1px solid var(--ink-3)',
              }}
            />
            <div style={{ fontSize: 14, marginTop: 4 }}>{name}</div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>{hex}</div>
          </div>
        ))}
      </div>

      {/* Window chrome, mirroring the mockup's .win / .titlebar / .win-body */}
      <div
        style={{
          marginTop: 24,
          width: 420,
          height: 200,
          background: 'var(--ink-2)',
          border: '2px solid var(--magenta)',
          boxShadow:
            '0 0 0 1px var(--ink), 0 8px 24px rgba(0,0,0,.6), 0 0 14px rgba(255,46,107,.35)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="pixel"
          style={{
            background: 'var(--magenta)',
            color: 'var(--ink)',
            padding: '6px 8px',
            fontSize: 10,
            letterSpacing: '.5px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>PROJECTS — EXPLORER.EXE</span>
          <span>_ □ X</span>
        </div>
        <div style={{ flex: 1, padding: '14px 16px', fontSize: 18 }}>
          <div
            className="pixel"
            style={{ fontSize: 11, color: 'var(--cyan)', marginBottom: 4 }}
          >
            NEON_RUNNER
          </div>
          <div style={{ opacity: 0.85, fontSize: 16, lineHeight: 1.3 }}>
            Retro-styled endless runner, built with vanilla JS + canvas. Body copy is VT323 at
            16-18px; this line exists to check the font actually loaded rather than falling back
            to a generic monospace.
          </div>
        </div>
      </div>

      {/* Taskbar chrome, mirroring the mockup's #taskbar */}
      <div
        style={{
          marginTop: 24,
          height: 44,
          width: 420,
          background: 'var(--ink-2)',
          borderTop: '2px solid var(--cyan)',
          boxShadow: '0 0 10px rgba(35,240,255,.35)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 10px',
        }}
      >
        <button
          className="pixel"
          style={{
            fontSize: 10,
            color: 'var(--ink)',
            background: 'var(--yellow)',
            border: 'none',
            padding: '9px 12px',
            cursor: 'pointer',
          }}
        >
          ▸ START
        </button>
        <div
          className="pixel"
          style={{
            fontSize: 9,
            color: 'var(--ink)',
            background: 'var(--magenta)',
            border: '1px solid var(--magenta)',
            padding: '8px 10px',
          }}
        >
          PROJECTS_EXPLORER.EXE
        </div>
        <div
          className="pixel"
          style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--green)' }}
        >
          00:00:00
        </div>
      </div>
    </div>
  )
}

export default App
