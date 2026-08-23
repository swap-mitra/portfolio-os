/* Recycle bin window: the same project rows, fed the decommissioned list.
   The joke only lands if these look like the real entries with the lights
   off, so the layout is shared and `.bin` just desaturates it. */

import './RecycleBinApp.css'
import { ProjectsApp } from './ProjectsApp'
import { decommissioned } from '../../data/decommissioned'

export function RecycleBinApp() {
  return (
    <div className="bin">
      <p className="bin-note">
        {decommissioned.length} items. Shipped, learned from, no longer maintained. The code still
        runs; I don&apos;t.
      </p>
      <ProjectsApp items={decommissioned} />
    </div>
  )
}
