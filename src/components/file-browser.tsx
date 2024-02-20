import React, { useState } from 'react'

interface CustomInputAttributes
    extends React.InputHTMLAttributes<HTMLInputElement> {
    webkitdirectory?: string
    directory?: string
}

interface FileBrowserProps {
    onFileSelected: (fileUrl: string) => void
}

const CustomInput: React.FC<CustomInputAttributes> = props => {
    return <input {...props} />
}

const FileBrowser: React.FC<FileBrowserProps> = ({ onFileSelected }) => {
    const [files, setFiles] = useState<File[]>([])

    const handleDirectoryChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (event.target.files) {
            const fileArray = Array.from(event.target.files).filter(
                file => file.type === 'application/pdf'
            )
            setFiles(fileArray)
            onFileSelected('')
        }
    }

    return (
        <div>
            <CustomInput
                type="file"
                webkitdirectory="true"
                directory="true"
                onChange={handleDirectoryChange}
                style={{ marginBottom: '10px' }}
            />
            <div>
                {files.map((file, index) => (
                    <div
                        key={index}
                        onClick={() =>
                            onFileSelected(URL.createObjectURL(file))
                        }
                    >
                        {file.name}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FileBrowser
