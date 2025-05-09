import { useState } from 'react'
import './App.css'

import KeywordRank from './components/KeyWordRank'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <KeywordRank />
      </div>
    </>
  )
}

export default App
