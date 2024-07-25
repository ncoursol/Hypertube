import { infoHash, size } from './torrent-parser'
import { Peer } from './types'
import { genId, log } from './utils'
import crypto from 'crypto'
import dgram from 'dgram'

export const getPeers = (torrent: any, url: string): Promise<Peer[]> => {
    return new Promise((resolve, reject) => {
        const formatUrl = new URL(url)
        const socket = dgram.createSocket('udp4')
        // TODO: loop, and accept udp/http/wss

        const timeout = setTimeout(() => {
            log(false, formatUrl.hostname, parseInt(formatUrl.port), 'Tracker timeout')
            socket.close()
            reject('timeout')
        }, 3000)

        socket.on('message', (response) => {
            if (respType(response) === 'connect') {
                const connResp = parseConnResp(response)
                log(true, formatUrl.hostname, parseInt(formatUrl.port), 'Tracker connect response')
                const announceReq = buildAnnounceReq(connResp.connectionId, torrent)
                udpSend(socket, announceReq, url)
            } else if (respType(response) === 'announce') {
                const announceResp = parseAnnounceResp(response)
                log(
                    true,
                    formatUrl.hostname,
                    parseInt(formatUrl.port),
                    'Tracker announce response : found ' + announceResp.peers.length + ' peers',
                )
                clearTimeout(timeout)
                socket.close()
                resolve(announceResp.peers)
            }
        })

        log(true, formatUrl.hostname, parseInt(formatUrl.port), 'Tracker request')
        udpSend(socket, buildConnReq(), url)
    })
}

function udpSend(socket: dgram.Socket, message: Buffer, rawUrl: string) {
    const url = new URL(rawUrl)
    socket.send(message, 0, message.length, parseInt(url.port), url.hostname, (err) => {
        if (err) {
            log(false, url.hostname, parseInt(url.port), 'udp send error: ' + err.message)
        }
    })
}

function respType(resp: Buffer) {
    const action = resp.readUInt32BE(0)
    if (action === 0) return 'connect'
    if (action === 1) return 'announce'
}

function buildConnReq() {
    const buf = Buffer.alloc(16)
    buf.writeUInt32BE(0x417, 0)
    buf.writeUInt32BE(0x27101980, 4)
    buf.writeUInt32BE(0, 8)
    crypto.randomBytes(4).copy(buf, 12)
    return buf
}

function parseConnResp(resp: Buffer) {
    return {
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        connectionId: resp.slice(8),
    }
}

function buildAnnounceReq(connId: Buffer, torrent: any, port = 6881) {
    const buf = Buffer.allocUnsafe(98)
    connId.copy(buf, 0)
    buf.writeUInt32BE(1, 8)
    crypto.randomBytes(4).copy(buf, 12)
    infoHash(torrent).copy(buf, 16)
    genId().copy(buf, 36)
    Buffer.alloc(8).copy(buf, 56)
    size(torrent).copy(buf, 64)
    Buffer.alloc(8).copy(buf, 72)
    buf.writeUInt32BE(0, 80)
    buf.writeUInt32BE(0, 84)
    crypto.randomBytes(4).copy(buf, 88)
    buf.writeInt32BE(-1, 92)
    buf.writeUInt16BE(port, 96)
    return buf
}

function parseAnnounceResp(resp: Buffer) {
    function group(iterable: Buffer, groupSize: number) {
        let groups = []
        for (let i = 0; i < iterable.length; i += groupSize) {
            groups.push(iterable.slice(i, i + groupSize))
        }
        return groups
    }

    return {
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        leechers: resp.readUInt32BE(8),
        seeders: resp.readUInt32BE(12),
        peers: group(resp.slice(20), 6).map((address) => {
            return {
                ip: address.slice(0, 4).join('.'),
                port: address.readUInt16BE(4),
            }
        }),
    }
}
