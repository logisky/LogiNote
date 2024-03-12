import * as React from 'react'
import {
    highlightPlugin,
    HighlightArea,
    RenderHighlightContentProps,
    RenderHighlightsProps,
    RenderHighlightTargetProps,
} from '@react-pdf-viewer/highlight'
import { Viewer, Worker } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'

import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import { useParams } from 'react-router-dom'
import ApiClient from '../core/api_client'
import { Grid, makeStyles } from '@material-ui/core'
import { HighlightSentenceViewerProps } from './highlight-sentence-viewer'
import { Sidebar } from './reader-sidebar'
import { useEffect } from 'react'
import { PageNotifier, useNotifierContext } from './reader-notifier'
import { Sentence } from '@loginote/types'

const useStyles = makeStyles(theme => ({
    root: {
        height: '100vh',
    },
    notesSection: {
        borderRight: `1px solid ${theme.palette.divider}`,
        overflow: 'auto',
    },
    note: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        cursor: 'pointer',
        padding: theme.spacing(1),
        width: '100%',
    },
    quote: {
        borderLeft: `4px solid ${theme.palette.divider}`,
        fontSize: '0.75rem',
        lineHeight: 1.5,
        margin: 0,
        marginBottom: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        textAlign: 'justify',
    },
    viewerSection: {
        overflow: 'auto',
    },
}))

const HighlightActionComponent: React.FC<HighlightSentenceViewerProps> = ({
    fileName,
    data,
    sentence,
    onChange,
}) => {
    const { setActiveTab, setHighlightData } = useNotifierContext()

    useEffect(() => {
        setHighlightData({ fileName, data, sentence, onChange: onChange })
        setActiveTab('highlights')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileName, data, sentence, setHighlightData, setActiveTab])
    return null
}

const PdfViewer: React.FC = () => {
    const { sentences, setSentences, setActiveTab } = useNotifierContext()
    const { filePath } = useParams()
    if (!filePath) throw Error('invalid file path when opening PDF file')

    const [pdfUrl, setPdfUrl] = React.useState<string>('')

    useEffect(() => {
        ApiClient.getFileExists(filePath).then(v => {
            if (v) {
                setPdfUrl(ApiClient.getFilePath(filePath))
                ApiClient.getFileSentences(filePath).then(v => {
                    setSentences(v)
                })
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const classes = useStyles()

    const renderHighlightTarget = (props: RenderHighlightTargetProps) => {
        return (
            <HighlightActionComponent
                fileName={filePath}
                data={props.highlightAreas}
                sentence={props.selectedText}
                onChange={(sentence: Sentence) => {
                    // console.log(sentence) console.log([...sentences, sentence])
                    setSentences([...sentences, sentence])
                    setActiveTab('notes')
                    props.cancel()
                }}
            ></HighlightActionComponent>
        )
    }

    const renderHighlightContent = (props: RenderHighlightContentProps) => {
        props.cancel()
        return <></>
    }

    const renderHighlights = (props: RenderHighlightsProps) => (
        <div>
            {sentences.map((sentence, index) => (
                <React.Fragment key={index}>
                    {sentence.source &&
                        sentence.source.highlightAreas
                            .filter(area => area.pageIndex === props.pageIndex)
                            .map((area, idx) => (
                                <div
                                    key={idx}
                                    style={Object.assign(
                                        {},
                                        {
                                            background: 'yellow',
                                            opacity: 0.4,
                                        },
                                        props.getCssProperties(
                                            area,
                                            props.rotation
                                        )
                                    )}
                                />
                            ))}
                </React.Fragment>
            ))}
        </div>
    )

    const highlightPluginInstance = highlightPlugin({
        renderHighlightTarget,
        renderHighlightContent,
        renderHighlights,
    })

    const { jumpToHighlightArea } = highlightPluginInstance

    const defaultLayoutPluginInstance = defaultLayoutPlugin()

    return (
        <Grid container className={classes.root}>
            <Grid item xs={3} className={classes.notesSection}>
                <Sidebar
                    jumpTo={(area: HighlightArea) => {
                        jumpToHighlightArea(area)
                    }}
                ></Sidebar>
            </Grid>
            <Grid item xs={9} className={classes.viewerSection}>
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                    <div style={{ height: '1200px' }}>
                        {pdfUrl && (
                            <Viewer
                                fileUrl={pdfUrl}
                                plugins={[
                                    defaultLayoutPluginInstance,
                                    highlightPluginInstance,
                                ]}
                            />
                        )}
                    </div>
                </Worker>
            </Grid>
        </Grid>
    )
}

const PdfViewerWrapper: React.FC = () => {
    return (
        <PageNotifier>
            <PdfViewer></PdfViewer>
        </PageNotifier>
    )
}

export default PdfViewerWrapper
