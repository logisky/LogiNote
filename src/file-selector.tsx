import React from 'react'

interface FileSelectorProps {
    onFileSelected: (fileUrl: string) => void
}

const FileSelector: React.FC<FileSelectorProps> = ({ onFileSelected }) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const fileUrl = URL.createObjectURL(event.target.files[0])
            onFileSelected(fileUrl)
        }
    }

    return (
        <div>
            <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
            />
        </div>
    )
}

export default FileSelector
