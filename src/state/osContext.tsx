/* React Context + useReducer wiring for the OS state (architecture.md §3).
   No Redux/Zustand at this scope. */

import { createContext, useContext, useMemo, useReducer } from 'react'
import type { Dispatch, ReactNode } from 'react'
import type { OSState } from '../types/os'
import { initialState, osReducer } from './osReducer'
import type { Action } from './osReducer'

interface OSContextValue {
  state: OSState
  dispatch: Dispatch<Action>
}

/* Undefined default so `useOS` outside a provider fails loudly rather than
   handing back a silently-dead dispatch. */
const OSContext = createContext<OSContextValue | undefined>(undefined)

export function OSProvider({
  children,
  initial = initialState,
}: {
  children: ReactNode
  /** Override for tests, and for merging persisted state on load (SPIKE-05). */
  initial?: OSState
}) {
  const [state, dispatch] = useReducer(osReducer, initial)
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
