/* About window contents (SPIKE-23). The pattern the other four apps follow:
   a component under apps/ that renders a typed file from src/data/ and
   nothing else. Window.tsx supplies the scrolling, padded body around it. */

import './AboutApp.css'
import { about } from '../../data/about'

export function AboutApp() {
  return (
    <>
      <h2 className="pixel about-name">{about.name}</h2>
      <p className="about-tagline">{about.tagline}</p>
      {about.paragraphs.map((text) => (
        <p key={text} className="about-para">
          {text}
        </p>
      ))}
    </>
  )
}
