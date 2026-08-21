/* Resume window contents (SPIKE-25). Option B, an inline preview with a
   download control under it.

   The spike framed option A (icon triggers a download, no window) as the
   simpler build. In this codebase it is the more complex one: both the
   desktop icon and the Start Menu's Documents entry dispatch OPEN_WINDOW,
   so A means special-casing two call sites and faking an anchor click,
   while B is one entry in Window.tsx's APP_BODIES and nothing else. B also
   keeps the desktop metaphor honest (a document opens in a window) and
   lets a visitor read the thing without committing to a file on disk. */

import './ResumeApp.css'
import { RESUME_PATH } from '../../data/siteConfig'

export function ResumeApp() {
  return (
    <div className="resume-app">
      {/* <object> renders its children when the browser can't display a PDF
          inline, which is the common case on mobile, so the fallback costs
          no feature detection of ours. */}
      <object className="resume-preview" data={RESUME_PATH} type="application/pdf">
        <p className="resume-fallback">
          This browser won&apos;t preview PDFs inline. Use the download below.
        </p>
      </object>
      <a className="pixel resume-download" href={RESUME_PATH} download>
        &#8681; DOWNLOAD RESUME.PDF
      </a>
    </div>
  )
}
