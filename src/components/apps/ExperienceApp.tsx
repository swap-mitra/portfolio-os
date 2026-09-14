/* Experience window contents. Same pattern as AboutApp: render a typed file
   from src/data/ and nothing else. Exists because the resume PDF does not
   preview on most phones, so this is the only work history a mobile visitor
   can read without downloading a file. */

import './ExperienceApp.css'
import { experience } from '../../data/experience'

export function ExperienceApp() {
  return (
    <>
      {experience.roles.map((role) => (
        <section key={role.company + role.period} className="xp-role">
          <h2 className="pixel xp-company">{role.company}</h2>
          <p className="xp-meta">
            {role.title} // {role.location} // {role.period}
          </p>
          {role.engagements.map((engagement) => (
            <div key={engagement.name} className="xp-engagement">
              <h3 className="xp-name">{engagement.name}</h3>
              <ul className="xp-bullets">
                {engagement.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
      <section className="xp-role">
        <h2 className="pixel xp-company">EDUCATION</h2>
        <p className="xp-meta">
          {experience.education.school} // {experience.education.period}
        </p>
        <p className="xp-degree">{experience.education.degree}</p>
      </section>
    </>
  )
}
