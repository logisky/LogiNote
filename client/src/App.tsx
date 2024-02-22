import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import HomePage from './components/home-page'
import PdfViewer from './components/pdf-viewer'

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />}></Route>
                <Route
                    path="/pdf-viewer/:filePath"
                    element={<PdfViewer />}
                ></Route>
            </Routes>
        </Router>
    )
}

export default App
