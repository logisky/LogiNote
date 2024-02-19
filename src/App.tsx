import React, { useState } from 'react'
import PDFViewer from './pdf-viewer'
import FileSelector from './file-selector'

const App: React.FC = () => {
    const [fileUrl, setFileUrl] = useState<string>('')

    return (
        <div className="App">
            <FileSelector onFileSelected={setFileUrl} />
            {fileUrl && <PDFViewer fileUrl={fileUrl} />}
        </div>
    )
}

export default App
