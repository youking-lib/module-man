import { useState } from 'react'
import logo from './logo.svg'
import { BlogComment } from './Comment'
import 'antd/dist/antd.css'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
      </header>
      <section className="App-body">
        <BlogComment />
      </section>
    </div>
  )
}

export default App
