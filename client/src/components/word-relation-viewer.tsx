import React, { useEffect, useRef, useState } from 'react'
import ApiClient from '../core/api_client'
import { DataSet, Edge, Network } from 'vis-network/standalone/esm/vis-network'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles({
    networkContainer: {
        width: '100%',
        height: '500px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '20px',
    },
    wordList: {
        listStyleType: 'none',
        padding: 0,
        '& li': {
            padding: '8px 0',
            borderBottom: '1px solid #eee',
        },
    },
    actionButton: {
        backgroundColor: '#007bff',
        color: '#ffffff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: '#0056b3',
        },
    },
})

interface Node {
    id: string
    label: string
}

const WordRelationsViewer: React.FC<{ word: string }> = ({ word }) => {
    const classes = useStyles()
    const [selectedWords, setSelectedWords] = useState<string[]>([])
    const networkContainer = useRef(null)
    const network = useRef<Network | null>(null)
    const nodes = useRef(new DataSet([{ id: word, label: '' }]))
    const edges = useRef(new DataSet<Edge>([]))

    const fetchData = async (w: string) => {
        const vocabulary = await ApiClient.getVocabulary(w)
        // const nodeData = await ApiClient.getVocabularyNode(w)

        let nodes: Node[] = []
        let edges: Edge[] = []
        vocabulary?.meanings.forEach(v => {
            v.definitions.forEach(d => {
                d.synonyms.forEach(s => {
                    const n = { id: s, label: '' }
                    nodes.push(n)

                    const e: Edge = { from: w, to: s, color: 'green' }
                    edges.push(e)
                })

                d.antonyms.forEach(s => {
                    const n = { id: s, label: '' }
                    nodes.push(n)

                    const e: Edge = { from: w, to: s, color: 'red' }
                    edges.push(e)
                })
            })
        })

        return {
            relatedWords: nodes,
            relationships: edges,
        }
    }

    useEffect(() => {
        if (networkContainer.current) {
            network.current = new Network(
                networkContainer.current,
                { nodes: nodes.current, edges: edges.current },
                {}
            )
        }

        network.current?.on('click', async function (params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0]
                const { relatedWords, relationships } = await fetchData(nodeId)

                relatedWords.forEach(node =>
                    nodes.current.add({ id: node.id, label: '' })
                )
                relationships.forEach(rel => edges.current.add(rel))
            }
        })
    }, [word])

    network.current?.on('doubleClick', async function (params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0]
            handleDoubleClick(nodeId)
        }
    })

    const handleDoubleClick = (word: string) => {
        const idx = selectedWords.indexOf(word)
        if (idx < 0) {
            setSelectedWords([...selectedWords, word])
        } else {
            setSelectedWords([
                ...selectedWords.slice(0, idx),
                ...selectedWords.slice(idx + 1),
            ])
        }
    }

    return (
        <div>
            <div
                ref={networkContainer}
                className={classes.networkContainer}
            ></div>
            <ul className={classes.wordList}>
                {selectedWords.map(word => (
                    <li key={word}>{word}</li>
                ))}
            </ul>
            <button className={classes.actionButton} onClick={() => {}}>
                Create Vocabulary Set
            </button>
        </div>
    )
}

export default WordRelationsViewer
