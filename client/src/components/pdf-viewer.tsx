import * as React from 'react'
import {
    highlightPlugin,
    HighlightArea,
    MessageIcon,
    RenderHighlightContentProps,
    RenderHighlightsProps,
    RenderHighlightTargetProps,
} from '@react-pdf-viewer/highlight'
import {
    Button,
    Position,
    PrimaryButton,
    Tooltip,
    Viewer,
    Worker,
} from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'

import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import { useParams } from 'react-router-dom'
import ApiClient from '../core/api_client'
import { Grid, Paper, Typography, makeStyles } from '@material-ui/core'
import HighlightSentenceViewer from './highlight-sentence-viewer'

interface SentenceBrief {
    id: number
    content: string
    highlightAreas: HighlightArea[]
}

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

const PdfViewer: React.FC = () => {
    const { filePath } = useParams()
    if (!filePath) throw Error('invalid file path when opening PDF file')

    const [message, setMessage] = React.useState('')
    const [notes, setNotes] = React.useState<SentenceBrief[]>([])
    const [pdfUrl, setPdfUrl] = React.useState<string>('')

    ApiClient.getFileExists(filePath).then(v => {
        if (v) {
            setPdfUrl(ApiClient.getFilePath(filePath))
        }
    })
    let noteId = notes.length

    const noteEles: Map<number, HTMLElement> = new Map()
    const classes = useStyles()

    const sentenceChange = (): void => {}

    const renderHighlightTarget = (props: RenderHighlightTargetProps) => {
        return (
            <div
                style={{
                    background: '#ffff',
                    display: 'flex',
                    zIndex: 100,
                    position: 'absolute',
                    left: `${props.selectionRegion.left - props.selectionRegion.width}%`,
                    top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
                    overflow: 'auto',
                    padding: '10px',
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    borderRadius: '4px',
                }}
            >
                <HighlightSentenceViewer
                    fileName={filePath}
                    sentence={props.selectedText}
                    data={props.highlightAreas}
                    onChange={() => {
                        sentenceChange()
                        props.toggle()
                    }}
                ></HighlightSentenceViewer>
            </div>
        )
    }

    const renderHighlightContent = (props: RenderHighlightContentProps) => {
        const addNote = () => {
            if (message !== '') {
                const note: SentenceBrief = {
                    id: ++noteId,
                    content: message,
                    highlightAreas: props.highlightAreas,
                }
                setNotes(notes.concat([note]))
                props.cancel()
            }
        }

        return (
            <div
                style={{
                    background: '#fff',
                    border: '1px solid rgba(0, 0, 0, .3)',
                    borderRadius: '2px',
                    padding: '8px',
                    position: 'absolute',
                    left: `${props.selectionRegion.left}%`,
                    top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
                    zIndex: 1,
                }}
            >
                <div>
                    <textarea
                        rows={3}
                        style={{
                            border: '1px solid rgba(0, 0, 0, .3)',
                        }}
                        onChange={e => setMessage(e.target.value)}
                    ></textarea>
                </div>
                <div
                    style={{
                        display: 'flex',
                        marginTop: '8px',
                    }}
                >
                    <div style={{ marginRight: '8px' }}>
                        <PrimaryButton onClick={addNote}>Add</PrimaryButton>
                    </div>
                    <Button onClick={props.cancel}>Cancel</Button>
                </div>
            </div>
        )
    }

    const jumpToNote = (note: SentenceBrief) => {
        if (noteEles.has(note.id)) {
            noteEles.get(note.id)?.scrollIntoView()
        }
    }

    const renderHighlights = (props: RenderHighlightsProps) => (
        <div>
            {notes.map(note => (
                <React.Fragment key={note.id}>
                    {note.highlightAreas
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
                                    props.getCssProperties(area, props.rotation)
                                )}
                                onClick={() => jumpToNote(note)}
                                ref={(ref): void => {
                                    noteEles.set(note.id, ref as HTMLElement)
                                }}
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
                {notes.length === 0 ? (
                    <Typography align="center">There is no note</Typography>
                ) : (
                    notes.map(note => (
                        <Paper
                            key={note.id}
                            className={classes.note}
                            onClick={() =>
                                jumpToHighlightArea(note.highlightAreas[0])
                            }
                            elevation={1}
                        >
                            <Typography variant="body2">
                                {note.content}
                            </Typography>
                        </Paper>
                    ))
                )}
            </Grid>
            <Grid item xs={9} className={classes.viewerSection}>
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                    {pdfUrl && (
                        <Viewer
                            fileUrl={pdfUrl}
                            plugins={[
                                defaultLayoutPluginInstance,
                                highlightPluginInstance,
                            ]}
                        />
                    )}
                </Worker>
            </Grid>
        </Grid>
    )
}

export default PdfViewer
