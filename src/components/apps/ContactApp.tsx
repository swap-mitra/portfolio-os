/* Contact window contents (SPIKE-26). Email is a mailto: — same tab, the
   browser hands it to a mail client and never navigates away. Profiles are
   external, so they get a new tab plus noopener noreferrer like the project
   links do. */

import './ContactApp.css'
import { contact } from '../../data/siteConfig'

export function ContactApp() {
  return (
    <>
      <h2 className="pixel contact-heading">GET IN TOUCH</h2>
      <ul className="contact-list">
        <li>
          <span className="contact-label">EMAIL</span>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </li>
        {contact.profiles.map((profile) => (
          <li key={profile.url}>
            <span className="contact-label">{profile.label}</span>
            <a href={profile.url} target="_blank" rel="noopener noreferrer">
              {profile.url.replace(/^https?:\/\//, '')}
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}
