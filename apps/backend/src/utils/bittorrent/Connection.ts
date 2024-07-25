import { buildCancel, buildHandshake, buildInterested, buildRequest, parse } from './message'
import TorrentManager from './torrentManager'
import { Block, Peer, BLOCK_LEN } from './types'
import { log } from './utils'
import net from 'net'

export default class Connection {
    private _peer: Peer
    private _tM: TorrentManager
    private _socket: net.Socket
    private _timeoutConnection: NodeJS.Timeout
    private _timeoutPiece: NodeJS.Timeout
    private _timeoutRequest: NodeJS.Timeout[]
    private _choked: boolean
    private _queue: Block[]
    private _handshake: boolean
    private _msgCount: number
    private _savedBuf: Buffer

    constructor(peer: Peer, torrentManager: TorrentManager) {
        this._peer = peer
        this._tM = torrentManager
        this._socket = new net.Socket()
        this._handshake = true
        this._msgCount = 0
        this._savedBuf = Buffer.alloc(0)
        this._timeoutRequest = []

        this._timeoutConnection = setTimeout(() => {
            this.destroy()
        }, 3000)

        this._timeoutPiece = setTimeout(() => {
            this.destroy()
        }, 20000)

        this._choked = true
        this._queue = []

        this._socket.on('error', (err) => {
            log(false, this._peer.ip, this._peer.port, 'CLOSING SOCKET: ' + err.message)
            this.destroy()
        })

        this._socket.on('data', (recvBuf) => {
            this._savedBuf = Buffer.concat([this._savedBuf, recvBuf])
            while (this.isMsgComplete()) {
                this._msgCount++
                this.handleMessage()
                this._savedBuf = this._savedBuf.slice(this.msgLen())
                this._handshake = false
            }
        })

        this._socket.connect(this._peer.port, this._peer.ip, () => {
            log(true, this._peer.ip, this._peer.port, 'Sending handshake')
            clearTimeout(this._timeoutConnection)
            this.sendHandskahe()
        })
    }

    sendHandskahe() {
        this._socket.write(buildHandshake(this._tM.infoHash()))
    }

    handleMessage() {
        const msg = this._savedBuf.slice(0, this.msgLen())
        if (isHandshake(msg)) {
            this._socket.write(buildInterested())
        } else {
            const m = parse(msg)
            switch (m.id) {
                case 0:
                    this.chokeHandler()
                    break
                case 1:
                    this.unchokeHandler()
                    break
                case 4:
                    this.haveHandler(m.payload!)
                    break
                case 5:
                    this.bitfieldHandler(m.payload!)
                    break
                case 7:
                    this.blockHandler(m.pieceResponse!)
                    break
                default:
                    this.logUnkownMessage(m.id)
                    break
            }
        }
    }

    blockHandler(pieceResp: { pieceIndex: number; begin: number; length: number; block: Buffer }) {
        this.logRecvBlock(pieceResp)
        // this._tM.printProgress()
        this._timeoutPiece.refresh()
        this._tM.handleBlockRecv(pieceResp)
        if (this._tM.isDone()) {
            this.destroy()
        } else {
            this.requestBlock()
        }
    }

    bitfieldHandler(payload: Buffer) {
        log(true, this._peer.ip, this._peer.port, 'Bitfield')
        const wasEmpty = this._queue.length === 0
        payload.forEach((byte, i) => {
            for (let j = 0; j < 8; j++) {
                if (byte % 2) {
                    const pieceIndex = i * 8 + 7 - j
                    this.queuePiece(pieceIndex)
                }
                byte = Math.floor(byte / 2)
            }
        })
        if (wasEmpty && this._queue.length) {
            this.requestBlock()
        }
    }

    haveHandler(payload: Buffer) {
        const pieceIndex = payload.readUInt32BE(0)
        log(true, this._peer.ip, this._peer.port, 'Have : ' + pieceIndex)
        const wasEmpty = this._queue.length === 0
        this.queuePiece(pieceIndex)
        if (wasEmpty && this.queueBlock.length) {
            this.requestBlock()
        }
    }

    unchokeHandler() {
        log(true, this._peer.ip, this._peer.port, 'Unchoked')
        this._choked = false
        if (this._queue.length > 0) {
            this.requestBlock()
        }
    }

    requestBlock() {
        if (this._choked) return
        if (this._queue.length === 0) {
            log(false, this._peer.ip, this._peer.port, 'CLOSING SOCKET BC QUEUE EMPTY!')
            this.destroy()
        }
        while (this._queue.length) {
            const block = this._queue.shift()!
            const status = this._tM.currentStatus(block)
            if (status === 'NEEDED' || (status === 'REQUESTED' && block.delayed)) {
                this.logRequestBlock(block)
                this._socket.write(buildRequest(block))
                status === 'NEEDED' && this._tM.updateStatus(block, 'REQUESTED')
                this._timeoutRequest.push(
                    setTimeout(() => {
                        if (this._tM.currentStatus(block) === 'REQUESTED') {
                            this.logCancelBlock(block)
                            this._socket.write(buildCancel(block))
                            this._tM.updateStatus(block, 'NEEDED')
                            this.requestBlock()
                        }
                    }, 3000),
                )
                break
            } else if (status === 'REQUESTED') {
                this.logAlreadyRequested(block)
                block.delayed = true
                this.queueBlock(block)
                this._queue.sort((a, b) => a.pieceIndex - b.pieceIndex)
                while (
                    this._queue.length &&
                    this._tM.currentStatus(this._queue[0]) === 'REQUESTED' &&
                    !this._queue[0].delayed
                ) {
                    const newBlock = this._queue.shift()!
                    newBlock.delayed = true
                    this.queueBlock(newBlock)
                }
            }
        }
    }

    chokeHandler() {
        log(false, this._peer.ip, this._peer.port, 'Choked')
        this._choked = true
    }

    isMsgComplete() {
        return this._savedBuf.length >= 4 && this._savedBuf.length >= this.msgLen()
    }

    private destroy() {
        this._socket.destroy()
        clearTimeout(this._timeoutConnection)
        clearTimeout(this._timeoutPiece)
        this._timeoutRequest.forEach((timeout) => clearTimeout(timeout))
        this._tM.removePeer(this._peer)
    }

    private queuePiece(pieceIndex: number) {
        const nBlocks = this._tM.blocksPerPiece(pieceIndex)
        for (let i = 0; i < nBlocks; i++) {
            const block = {
                pieceIndex,
                begin: i * BLOCK_LEN,
                length: this._tM.blockLen(pieceIndex, i),
                delayed: false,
            }
            this._queue.push(block)
        }
    }

    private queueBlock(block: Block) {
        this._queue.push(block)
    }

    private msgLen() {
        return this._handshake ? this._savedBuf.readInt8(0) + 49 : this._savedBuf.readInt32BE(0) + 4
    }

    logRecvData(recvBuf: Buffer) {
        log(
            true,
            this._peer.ip,
            this._peer.port,
            'Received : ' + recvBuf.length + ' bytes (msg ' + this._msgCount + ')',
        )
    }

    logParseData() {
        log(
            true,
            this._peer.ip,
            this._peer.port,
            'Parsing : ' +
                this.msgLen() +
                ' bytes (msg ' +
                this._msgCount +
                ') from ' +
                this._savedBuf.length +
                ' bytes saved',
        )
    }

    logUnkownMessage(id: any) {
        log(false, this._peer.ip, this._peer.port, 'Unknown message : ' + id)
    }

    logRequestBlock(block: Block) {
        const logMsg =
            'Request : ' +
            block.pieceIndex +
            ' - ' +
            block.begin / BLOCK_LEN +
            ' - ' +
            block.length +
            ' bytes'
        log(true, this._peer.ip, this._peer.port, logMsg)
    }

    private logAlreadyRequested(block: Block) {
        log(
            false,
            this._peer.ip,
            this._peer.port,
            'Block already requested : ' + block.pieceIndex + ' - ' + block.begin / BLOCK_LEN,
        )
    }

    logCancelBlock(block: Block) {
        log(
            false,
            this._peer.ip,
            this._peer.port,
            'Cancel : ' +
                block.pieceIndex +
                ' - ' +
                block.begin / BLOCK_LEN +
                ' - ' +
                block.length +
                ' bytes',
        )
    }

    private logRecvBlock(pieceResp: {
        pieceIndex: number
        begin: number
        length: number
        block: Buffer
    }) {
        log(
            true,
            this._peer.ip,
            this._peer.port,
            'Received : ' +
                pieceResp.pieceIndex +
                ' - ' +
                pieceResp.begin / BLOCK_LEN +
                ' - ' +
                pieceResp.block.length +
                ' bytes',
        )
    }
}

const PROTOCOL = 'BitTorrent protocol'

function isHandshake(msg: Buffer) {
    return msg.length === msg.readUInt8(0) + 49 && msg.toString('utf8', 1, 20) === PROTOCOL
}
