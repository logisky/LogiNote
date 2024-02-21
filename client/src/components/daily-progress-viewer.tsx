import React, { useEffect, useState } from 'react'
import ApiClient from '../core/api_client'
import { TotalProgress, DailyProgress, SentenceId } from '@loginote/types'

const DailyProgressViewer: React.FC = () => {
    const [dates, setDates] = useState<string[]>([])
    const [totalProgress, setTotalProgress] = useState<TotalProgress | null>(
        null
    )
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [progress, setDailyProgress] = useState<DailyProgress | null>(null)

    useEffect(() => {
        const fetchTotalProgress = async () => {
            const response = await ApiClient.getTotalProgress()
            setTotalProgress(response)
            setDates(response?.dateList ?? [])
        }

        fetchTotalProgress()
    }, [])

    const handleSelectDate = async (date: string) => {
        setSelectedDate(date)
        const response = await ApiClient.getDailyProgress(date)
        setDailyProgress(response)
    }

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ flex: '1' }}>
                {dates.map(date => (
                    <div key={date} onClick={() => handleSelectDate(date)}>
                        {date}
                    </div>
                ))}
            </div>
            <div style={{ flex: '3' }}>
                {selectedDate && progress ? (
                    <div>
                        <div
                            style={{
                                padding: '20px',
                                border: '1px solid #ccc',
                                margin: '10px',
                            }}
                        >
                            <h2>Daily Progress for {progress.date}</h2>
                            <div>
                                <h3>New Words:</h3>
                                <ul>
                                    {progress.newWords.map((word, index) => (
                                        <li key={index}>{word}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3>Sentences:</h3>
                                <ul>
                                    {progress.sentences.map(
                                        (sentenceId: SentenceId, index) => (
                                            <li key={index}>{sentenceId}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                            <div>
                                <h3>Updated Set IDs:</h3>
                                <ul>
                                    {progress.updatedSetIds.map(
                                        (setId, index) => (
                                            <li key={index}>{setId}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                            <div>
                                <h3>Good Expressions IDs:</h3>
                                <ul>
                                    {progress.goodExprIds.map(
                                        (exprId, index) => (
                                            <li key={index}>{exprId}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                            <div>
                                <h3>Articles:</h3>
                                <ul>
                                    {progress.articles.map((article, index) => (
                                        <li key={index}>{article}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : totalProgress ? (
                    <div>
                        <h3>Total Progress</h3>
                        <p>Total Days: {totalProgress.dateList.length}</p>
                        <p>Total Words: {totalProgress.words}</p>
                        <p>Total Sentences: {totalProgress.sentences}</p>
                        <p>Total VocabularySets: {totalProgress.sets}</p>
                        <p>Total Articles: {totalProgress.articles}</p>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    )
}

export default DailyProgressViewer
