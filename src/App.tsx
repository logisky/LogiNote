import React, { useState } from 'react'
import PDFViewer from './components/pdf-viewer'
import Sidebar from './components/sidebar'
import VocabularyViewer from './components/vocabulary-viewer'

const App: React.FC = () => {
    const [fileUrl, setFileUrl] = useState<string>('')
    const [word, setWord] = useState<string>('')

    return (
        <div className="App">
            <Sidebar onFileSelected={setFileUrl} />
            {fileUrl && <PDFViewer fileUrl={fileUrl} />}
            <input
                type="text"
                value={word}
                placeholder="Enter a word"
                onChange={e => setWord(e.target.value)}
            />
            {word && <VocabularyViewer word={word} />}
        </div>
    )
}

export default App
