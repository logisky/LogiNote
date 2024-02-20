import React, { useState } from 'react'
import FileBrowser from './file-browser' // 假设这是我们即将创建的文件浏览组件
import styles from './sidebar.module.css'

interface SidebarProps {
    onFileSelected: (fileUrl: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ onFileSelected }) => {
    const [activeTab, setActiveTab] = useState<string>('fileBrowser')

    return (
        <div className={styles.sidebar}>
            <div className={styles.tabs}>
                <button onClick={() => setActiveTab('fileBrowser')}>
                    文件浏览
                </button>
                {/* 可以在这里添加更多按钮来切换不同的子页面 */}
            </div>
            <div className={styles.content}>
                {activeTab === 'fileBrowser' && (
                    <FileBrowser onFileSelected={onFileSelected} />
                )}
                {/* 根据activeTab渲染不同的组件 */}
            </div>
        </div>
    )
}

export default Sidebar
