import React from 'react'
import { createRoot } from 'react-dom/client'

function Foo() {
  const [clicks, setClicks] = React.useState(0)

  return <div>
    <p>Hello, world...</p>
    <p>{clicks}</p>
    <p><button onClick={() => setClicks(c => c + 1)}>Click</button></p>
  </div>
}

document.body.innerHTML = '<div id="app"></div>'
const root = createRoot(document.getElementById('app')!)
root.render(<Foo />)
