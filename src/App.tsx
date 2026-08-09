/* Phase 2 scaffold. WindowManager and Taskbar are the real components; the
   floating panel below is a debug harness for opening windows and inspecting
   state without DesktopIconGrid/StartMenu, which land in Phase 3. Both the
   panel and this file get replaced by the real Desktop then. */

import { OSProvider, useOS } from './state/osContext'
import { WindowManager } from './components/WindowManager'
import { Taskbar } from './components/Taskbar'

function DebugPanel() {
  const { state, dispatch } = useOS()

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1000,
        padding: 12,
        background: 'rgba(11, 11, 22, 0.85)',
        // Only the controls below opt back in — otherwise this overlay's
        // padding/background would sit above the default window position
        // (250,90) and silently swallow drags/clicks meant for the window.
        pointerEvents: 'none',
      }}
    >
      <div className="pixel" style={{ fontSize: 10, color: 'var(--cyan)', letterSpacing: 2 }}>
        PORTFOLIO-OS — PHASE 2 HARNESS
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, pointerEvents: 'auto' }}>
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

      <pre
        style={{ fontSize: 13, marginTop: 12, color: 'var(--green)', fontFamily: 'inherit' }}
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
      <div style={{ position: 'relative', height: '100%' }}>
        <DebugPanel />
        <WindowManager />
        <Taskbar />
      </div>
    </OSProvider>
  )
}

export default App
