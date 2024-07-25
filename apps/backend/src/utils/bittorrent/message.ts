import { infoHash } from './torrent-parser'
import { Block } from './types'
import { genId } from './utils'

export const PROTOCOL = 'BitTorrent protocol'

export const buildHandshake = (infoHash: Buffer) => {
    const buf = Buffer.alloc(68)
    buf.writeUInt8(19, 0)
    buf.write(PROTOCOL, 1)
    buf.writeUInt32BE(0, 20)
    buf.writeUInt32BE(0, 24)
    infoHash.copy(buf, 28)
    genId().copy(buf, 48)
    return buf
}

export const buildInterested = () => {
    const buf = Buffer.alloc(5)
    buf.writeUInt32BE(1, 0)
    buf.writeUInt8(2, 4)
    return buf
}

export const buildRequest = (block: Block) => {
    const buf = Buffer.alloc(17)
    buf.writeUInt32BE(13, 0)
    buf.writeUInt8(6, 4)
    buf.writeUInt32BE(block.pieceIndex, 5)
    buf.writeUInt32BE(block.begin, 9)
    buf.writeUInt32BE(block.length, 13)
    return buf
}

// TODO: use when block received and file > 90% complete
export const buildCancel = (block: Block) => {
    const buf = Buffer.alloc(17)
    buf.writeUInt32BE(13, 0)
    buf.writeUInt8(8, 4)
    buf.writeUInt32BE(block.pieceIndex, 5)
    buf.writeUInt32BE(block.begin, 9)
    buf.writeUInt32BE(block.length, 13)
    return buf
}

interface ParseResult {
    id: number
    payload?: Buffer
    pieceResponse?: {
        pieceIndex: number
        begin: number
        length: number
        block: Buffer
    }
}

export const parse = (msg: Buffer): ParseResult => {
    const id = msg.length > 4 ? msg.readInt8(4) : null
    let payload = msg.length > 5 ? msg.slice(5) : null
    if (id === 6 || id === 7 || id === 8) {
        const pieceResponse = {
            pieceIndex: payload.readInt32BE(0),
            begin: payload.readInt32BE(4),
            length: payload.readInt32BE(8),
            block: payload.slice(8),
        }

        // We are not delaing with case 6 and 8
        // dataPayload[id === 7 ? 'block' : 'length'] = rest
        return { id, pieceResponse }
    }
    return { id, payload }
}
