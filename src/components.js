import React from 'react'

export const Introduction = () => (
  <article className="mw7 center ph3 ph5-ns tc br2 pv5 bg-washed-green dark-green">
    <h1 className="fw6 f3 f2-ns lh-title mt0 mb3">Welcome</h1>
    <h2 className="fw2 f4 lh-copy mt0 mb3">The following is a list of the most popular content out right now.</h2>
    <p className="fw1 f5 mt0 mb3">Come back often and see what else is new.</p>
  </article>
)

export const StyledButton = ({ onClick, href, children }) => (
  <div className="" onClick={onClick}>
    <a
      href={href || '#'}
      className="f6 br-pill bg-dark-green no-underline washed-green ba b--dark-green grow pv2 ph3 dib mr3"
    >
      {children}
    </a>
  </div>
)
