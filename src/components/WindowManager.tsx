/* Renders every open window inside its own stacking context (SPIKE-08,
   architecture.md §5/§6 — see Window.css for why that's required). */

import { useOS } from '../state/osContext'
import { Window } from './Window'

export function WindowManager() {
  const { state } = useOS()

  return (
    <div className="window-manager">
      {Object.values(state.windows).map((w) => (
        <Window key={w.id} window={w} />
      ))}
    </div>
  )
}
