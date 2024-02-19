import React, { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// 引入样式文件
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const App: React.FC = () => {
    const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0];
            // 创建一个新的URL并更新状态
            const url = URL.createObjectURL(selectedFile);
            setFileUrl(url);
        }
    };

    // 当组件卸载或fileUrl变化时，清理旧的URL
    useEffect(() => {
        return () => {
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [fileUrl]);

    return (
        <div className="App">
            <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ marginBottom: '20px' }}
            />
            {fileUrl && (
                <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                    <Viewer
                        fileUrl={fileUrl}
                        plugins={[defaultLayoutPluginInstance]}
                    />
                </Worker>
            )}
        </div>
    );
};

export default App;
