import Connection from './Connection'
import { encode } from './bencoding'
import { getPeers } from './tracker'
import { Peer, BLOCK_LEN, BlockStatus, Block, File } from './types'
import crypto from 'crypto'
import { EventEmitter } from 'events'
import fs from 'fs'
import path from 'path'

const maxConnections = 30

export default class TorrentManager extends EventEmitter {
    private _torrent: any
    private _peers: Peer[]
    private _retry: boolean
    private _activeConnectionsCount: number
    private _blockStatus: BlockStatus[][]
    private _fileList: File[]
    private _isComplete: boolean
    private _movieBytesStatus: [start: number, end: number][]
    private _videoLength: number

    constructor(torrent: any) {
        super()
        this._torrent = torrent
        this._peers = []
        this._activeConnectionsCount = 0
        this._retry = false
        this._fileList = []
        this._isComplete = false
        this._movieBytesStatus = []
        this._videoLength = 0

        const login42 = __dirname.split(path.sep)[4]
        const downloadsDir = login42
            ? path.join('/sgoinfre/goinfre/Perso', login42, 'movies')
            : 'downloads'
        const pathName = path.join(downloadsDir, torrent.info.name)
        if (torrent.info.files) {
            console.log('Torrent contains multiple files')
            fs.mkdirSync(pathName, { recursive: true })
            torrent.info.files.forEach((file: { path: string[]; length: number }) => {
                const filePath = path.join(pathName, file.path[0])
                if (
                    filePath.endsWith('.mp4') ||
                    filePath.endsWith('.webm') ||
                    filePath.endsWith('.mkv')
                ) {
                    this._videoLength = file.length
                }
                const fd = fs.openSync(filePath, 'w')
                this._fileList.push({ path: filePath, length: file.length, fd })
            })
        } else {
            console.log('Torrent contains single file')
            const fd = fs.openSync(pathName, 'w')
            this._videoLength = torrent.info.length
            this._fileList.push({
                path: pathName,
                length: torrent.info.length,
                fd,
            })
        }

        const buildBlockStatusArray = (): BlockStatus[][] => {
            const nPieces = this._torrent.info.pieces.length / 20
            return new Array(nPieces).fill(null).map((_, i) =>
                new Array(this.blocksPerPiece(i)).fill(null).map((_, j) => {
                    return { status: 'NEEDED', data: null }
                }),
            )
        }

        this._blockStatus = buildBlockStatusArray()
    }

    async start() {
        this.emit('ready', this._fileList)
        await this.findPeers()
        this.manageConnections()
    }

    getVideoLength(): number {
        return this._videoLength
    }

    getMovieBytesStatus(): [start: number, end: number][] {
        return this._movieBytesStatus
    }

    async manageConnections() {
        while (
            this._activeConnectionsCount < maxConnections &&
            this._peers.length > 0 &&
            !this._isComplete
        ) {
            const peer = this._peers.shift()
            new Connection(peer!, this)
            this._activeConnectionsCount++
        }
        if (!this._activeConnectionsCount && !this._retry && !this._isComplete) {
            this._retry = true
            await this.findPeers()
            this.manageConnections()
        }
        if (!this._isComplete) {
            this.emit('done', false)
        }
    }

    removePeer(peer: Peer) {
        this._activeConnectionsCount--
        this.manageConnections()
    }

    async findPeers() {
        for (const tracker of this._torrent['announce-list']) {
            const url = tracker[0]
            if (url.startsWith('udp://')) {
                try {
                    const newPeers = await getPeers(this._torrent, url)
                    this.pushUniquePeers(newPeers)
                } catch (err) {}
            }
        }
    }

    pushUniquePeers(peers: Peer[]) {
        peers.forEach((peer: Peer) => {
            const inPeers = this._peers.find((p: Peer) => p.ip === peer.ip && p.port === peer.port)
            if (inPeers === undefined) {
                this._peers.push(peer)
            }
        })
    }

    size(): number {
        if (this._torrent.info.files)
            return this._torrent.info.files
                .map((file: { path: string[]; length: number }) => file.length)
                .reduce((a: number, b: number) => a + b)
        return this._torrent.info.length
    }

    piecesCount(): number {
        console.log('Piece count method 1: ', this._torrent.info.pieces.length / 20)
        return this._torrent.info.pieces.length / 20
    }

    blocksPerPiece = (pieceIndex: number): number => {
        const pieceLength = this.pieceLen(pieceIndex)
        return Math.ceil(pieceLength / BLOCK_LEN)
    }

    pieceLen(pieceIndex: number): number {
        const totalLength = this.size()
        const pieceLength = this._torrent.info['piece length']
        return pieceIndex === Math.floor(totalLength / pieceLength)
            ? totalLength % pieceLength
            : pieceLength
    }

    blockLen(pieceIndex: number, blockIndex: number) {
        const pieceLength = this.pieceLen(pieceIndex)
        return blockIndex === Math.floor(pieceLength / BLOCK_LEN)
            ? pieceLength % BLOCK_LEN
            : BLOCK_LEN
    }

    infoHash(): Buffer {
        return crypto.createHash('sha1').update(encode(this._torrent.info)).digest()
    }

    printProgress() {
        const percent = this.percentDone().toFixed(2)
        const message = 'progress: ' + percent + '%\r'
        process.stdout.write(message)
    }

    percentDone() {
        const downloaded = this._blockStatus.reduce((totalBlocks, blocks) => {
            return blocks.filter((i) => i.status === 'RECEIVED').length + totalBlocks
        }, 0)

        const total = this._blockStatus.reduce((totalBlocks, blocks) => {
            return blocks.length + totalBlocks
        }, 0)

        return (downloaded / total) * 100
    }

    addBlock(pieceResp: { pieceIndex: number; begin: number; length: number; block: Buffer }) {
        const blockIndex = pieceResp.begin / BLOCK_LEN
        this._blockStatus[pieceResp.pieceIndex][blockIndex] = {
            status: 'RECEIVED',
            data: pieceResp.block,
        }
        if (this.pieceIsComplete(pieceResp.pieceIndex)) {
            if (this.pieceIsCorrect(pieceResp.pieceIndex)) {
                this.writePieceToFile(pieceResp.pieceIndex)
                this.emit('pieceDone', pieceResp.pieceIndex, this._movieBytesStatus)
                this.checkIfComplete()
            } else {
                this._blockStatus[pieceResp.pieceIndex].forEach((block) => {
                    block.status = 'NEEDED'
                    block.data = null
                })
            }
        }
    }

    isDone() {
        return this._isComplete
    }

    checkIfComplete() {
        if (
            this._blockStatus.every((piece) => piece.every((block) => block.status === 'RECEIVED'))
        ) {
            this._isComplete = true
            this.emit('done', true)
        }
    }

    writePieceToFile(pieceIndex: number) {
        const pieceData = Buffer.concat(this._blockStatus[pieceIndex].map((b) => b.data!))
        const offset = pieceIndex * this._torrent.info['piece length']

        let fileOffset = 0
        for (let i = 0; i < this._fileList.length; i++) {
            const file = this._fileList[i]
            const start = fileOffset
            const end = start + file.length

            // Check if the block overlaps with this file (check if end is after start and start is before end)
            if (offset < end && offset + pieceData.length > start) {
                const startOffset = Math.max(start, offset) - offset
                const endOffset = Math.min(end, offset + pieceData.length) - offset
                const writeOffset = Math.max(start, offset) - start

                fs.write(
                    file.fd,
                    pieceData,
                    startOffset,
                    endOffset - startOffset,
                    writeOffset,
                    () => {},
                )

                if (
                    file.path.endsWith('.mp4') ||
                    file.path.endsWith('.webm') ||
                    file.path.endsWith('.mkv')
                ) {
                    const start = writeOffset
                    const end = writeOffset + endOffset - startOffset
                    // Insert [start, end] into this._movieBytesStatus at the right place and if it is adjacent to any other ranges, merge them
                    let inserted = false
                    for (let i = 0; i < this._movieBytesStatus.length; i++) {
                        const range = this._movieBytesStatus[i]
                        if (end <= range[0]) {
                            this._movieBytesStatus.splice(i, 0, [start, end])
                            inserted = true
                            this.mergeAdjacent(i)
                            break
                        }
                    }
                    if (!inserted) {
                        this._movieBytesStatus.push([start, end])
                        this.mergeAdjacent(this._movieBytesStatus.length - 1)
                    }
                }
            }

            fileOffset += file.length
        }
    }

    private mergeAdjacent(index: number): void {
        // Merge with the previous range if adjacent
        if (
            index > 0 &&
            this._movieBytesStatus[index - 1][1] === this._movieBytesStatus[index][0]
        ) {
            this._movieBytesStatus[index - 1][1] = this._movieBytesStatus[index][1]
            this._movieBytesStatus.splice(index, 1)
            index--
        }

        // Merge with the next range if adjacent
        if (
            index < this._movieBytesStatus.length - 1 &&
            this._movieBytesStatus[index][1] === this._movieBytesStatus[index + 1][0]
        ) {
            this._movieBytesStatus[index][1] = this._movieBytesStatus[index + 1][1]
            this._movieBytesStatus.splice(index + 1, 1)
        }
    }

    pieceIsCorrect(pieceIndex: number) {
        const hash = crypto.createHash('sha1')
        const pieceData = Buffer.concat(this._blockStatus[pieceIndex].map((b) => b.data!))
        hash.update(pieceData)
        const digest = hash.digest()
        return digest.equals(this._torrent.info.pieces.slice(pieceIndex * 20, pieceIndex * 20 + 20))
    }

    pieceIsComplete(pieceIndex: number) {
        return this._blockStatus[pieceIndex].every((block) => block.status === 'RECEIVED')
    }

    currentStatus(pieceResp: {
        pieceIndex: number
        begin: number
        length: number
        block?: Buffer
    }): 'RECEIVED' | 'REQUESTED' | 'NEEDED' {
        const blockIndex = pieceResp.begin / BLOCK_LEN
        return this._blockStatus[pieceResp.pieceIndex][blockIndex].status
    }

    updateStatus(block: Block, status: 'RECEIVED' | 'REQUESTED' | 'NEEDED') {
        this._blockStatus[block.pieceIndex][block.begin / BLOCK_LEN].status = status
    }

    handleBlockRecv(pieceResp: {
        pieceIndex: number
        begin: number
        length: number
        block: Buffer
    }) {
        const status = this.currentStatus(pieceResp)
        if (status !== 'RECEIVED') {
            this.addBlock(pieceResp)
        }
    }
}
