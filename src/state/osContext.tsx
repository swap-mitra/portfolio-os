/* React Context + useReducer wiring for the OS state (architecture.md §3).
   No Redux/Zustand at this scope. */

import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { Dispatch, ReactNode } from 'react'
import type { OSState } from '../types/os'
import { osReducer } from './osReducer'
import type { Action } from './osReducer'
import { hydrateInitialState, saveMusicState } from './persistence'

interface OSContextValue {
  state: OSState
  dispatch: Dispatch<Action>
}

/* Undefined default so `useOS` outside a provider fails loudly rather than
   handing back a silently-dead dispatch. */
const OSContext = createContext<OSContextValue | undefined>(undefined)

export function OSProvider({
  children,
  initial,
}: {
  children: ReactNode
  /** Full state override for tests. When given, persisted preferences are not
      merged in — the caller gets exactly the state they asked for. */
  initial?: OSState
}) {
  /* Third argument is React's lazy initializer: it runs once, so the
     localStorage read doesn't repeat on every render (SPIKE-05). */
  const [state, dispatch] = useReducer(
    osReducer,
    initial,
    (override) => override ?? hydrateInitialState(),
  )

  /* Mirror music preferences back to localStorage. Debounced inside
     saveMusicState, since a volume drag fires a change per pixel. */
  useEffect(() => {
    saveMusicState(state.music)
  }, [state.music])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>
}

/* oxlint-disable-next-line react/only-export-components -- OSProvider and
   useOS are deliberately colocated (architecture.md §3). Splitting them to
   satisfy this rule would mean three modules (context, provider, hook) to buy
   fast refresh on a file that changes almost never. The only cost is a full
   reload when this specific file is edited. */
export function useOS(): OSContextValue {
  const value = useContext(OSContext)
  if (value === undefined) throw new Error('useOS must be used inside an OSProvider')
  return value
}
