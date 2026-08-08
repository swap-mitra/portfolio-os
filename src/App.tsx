/* Phase 1 scaffold. The token-proof page from SPIKE-02 has served its purpose;
   this is a temporary state-inspector harness confirming OSProvider/useOS work
   end to end. Both get replaced by the real Desktop in Phase 2/3. */

import { OSProvider, useOS } from './state/osContext'

function StateHarness() {
  const { state, dispatch } = useOS()
  const viewport = { width: window.innerWidth, height: window.innerHeight }

  return (
    <div style={{ padding: 20, height: '100%', overflowY: 'auto' }}>
      <div className="pixel" style={{ fontSize: 10, color: 'var(--cyan)', letterSpacing: 2 }}>
        PORTFOLIO-OS — STATE HARNESS
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
        {(['about', 'projects', 'resume', 'contact', 'terminal'] as const).map((appType) => (
          <button
            key={appType}
            className="pixel"
            style={{
              fontSize: 9,
              padding: '8px 10px',
              background: 'var(--ink-3)',
              color: 'var(--paper)',
              border: '1px solid var(--magenta)',
              cursor: 'pointer',
            }}
            onClick={() => dispatch({ type: 'OPEN_WINDOW', appType })}
          >
            OPEN {appType.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        {Object.values(state.windows).map((w) => (
          <div key={w.id} style={{ display: 'flex', gap: 4 }}>
            <span style={{ fontSize: 16, alignSelf: 'center' }}>{w.id}</span>
            <button onClick={() => dispatch({ type: 'FOCUS_WINDOW', id: w.id })}>focus</button>
            <button onClick={() => dispatch({ type: 'MINIMIZE_WINDOW', id: w.id })}>_</button>
            <button onClick={() => dispatch({ type: 'TOGGLE_MAXIMIZE', id: w.id, viewport })}>
              □
            </button>
            <button onClick={() => dispatch({ type: 'RESTORE_WINDOW', id: w.id })}>restore</button>
            <button onClick={() => dispatch({ type: 'CLOSE_WINDOW', id: w.id })}>X</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
        <button onClick={() => dispatch({ type: 'LOAD_TRACK', videoId: 'aAkMkVFwAoo' })}>
          load track
        </button>
        <button onClick={() => dispatch({ type: 'SET_VOLUME', volume: 23 })}>volume 23</button>
        <button onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}>mute</button>
        <button onClick={() => dispatch({ type: 'OPEN_WINDOW', appType: 'about' })}>
          open about
        </button>
      </div>

      <pre
        id="state-dump"
        style={{ fontSize: 14, marginTop: 16, color: 'var(--green)', fontFamily: 'inherit' }}
      >
        {JSON.stringify(
          {
            windowIds: Object.keys(state.windows),
            focusedWindowId: state.focusedWindowId,
            zIndexes: Object.values(state.windows).map((w) => `${w.id}:${w.zIndex}`),
            minimized: Object.values(state.windows)
              .filter((w) => w.minimized)
              .map((w) => w.id),
            nextZIndex: state.nextZIndex,
            music: {
              videoId: state.music.videoId,
              isDefaultTrack: state.music.isDefaultTrack,
              volume: state.music.volume,
              isMuted: state.music.isMuted,
              isPlaying: state.music.isPlaying,
              awaitingUserGesture: state.music.awaitingUserGesture,
            },
          },
          null,
          2,
        )}
      </pre>
    </div>
  )
}

function App() {
  return (
    <OSProvider>
      <StateHarness />
    </OSProvider>
  )
}

export default App
