import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Search'
import Dashboard2 from './pages/Dashboard2'
import Search from './pages/Search'
import Results from './pages/Results'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard2 />} />
        <Route path="/search" element={<Search/>} /> 
        <Route path="/search-result" element={<Results/>} /> 
      </Routes>
    </Router>
  )
}

export default App
