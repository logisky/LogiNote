import React, { useState } from 'react'
import PDFViewer from './components/pdf-viewer'
import Sidebar from './components/sidebar'

const App: React.FC = () => {
    const [fileUrl, setFileUrl] = useState<string>('')

    return (
        <div className="App">
            <Sidebar onFileSelected={setFileUrl} />
            {fileUrl && <PDFViewer fileUrl={fileUrl} />}
        </div>
    )
}

export default App
