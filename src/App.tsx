/* Phase 3 replaces the Phase 2 debug harness: App now plays the boot
   sequence once, then mounts the real Desktop (architecture.md §2). */

import { useState } from 'react'
import { OSProvider } from './state/osContext'
import { BootScreen } from './components/BootScreen'
import { Desktop } from './components/Desktop'

function App() {
  const [booted, setBooted] = useState(false)

  return <OSProvider>{booted ? <Desktop /> : <BootScreen onDone={() => setBooted(true)} />}</OSProvider>
}

export default App
