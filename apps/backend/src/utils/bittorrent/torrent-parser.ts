import { decode, encode } from './bencoding'
import axios from 'axios'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'

type BencodeValue = string | number | Buffer | BencodeValue[] | { [key: string]: BencodeValue }

export const BLOCK_LEN = 1 << 14

// TODO: type torrent

export const pieceLen = (torrent: any, pieceIndex: number): number => {
    const totalLength = Number(size(torrent).readBigInt64BE())
    const pieceLength = torrent.info['piece length']
    return pieceIndex === Math.floor(totalLength / pieceLength)
        ? totalLength % pieceLength
        : pieceLength
}

export const blocksPerPiece = (torrent: any, pieceIndex: number): number => {
    const pieceLength = pieceLen(torrent, pieceIndex)
    return Math.ceil(pieceLength / BLOCK_LEN)
}

export const blockLen = (torrent: any, pieceIndex: number, blockIndex: number): number => {
    const pieceLength = pieceLen(torrent, pieceIndex)
    return blockIndex === Math.floor(pieceLength / BLOCK_LEN) ? pieceLength % BLOCK_LEN : BLOCK_LEN
}

// TODO: type decode
export const open = async (url: string): Promise<any> => {
    //Fetch the torrent file from the url
    try {
        // Create a temporary file path
        const tempDir = os.tmpdir()
        const tempFilePath = path.join(tempDir, 'tempfile')

        // Download the file
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
        })

        // Save the file to the temporary path
        const writer = fs.createWriteStream(tempFilePath)
        response.data.pipe(writer)

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
        })

        // Read the file
        const torrent = decode(fs.readFileSync(tempFilePath))

        // Delete the file after reading
        fs.unlinkSync(tempFilePath)

        return torrent
    } catch (error) {
        console.error('Error:', error)
    }
}

export const size = (torrent: any): Buffer => {
    const buf = Buffer.alloc(8)
    let size = torrent.info.files
        ? torrent.info.files.map((file: any) => file.length).reduce((a: number, b: number) => a + b)
        : torrent.info.length
    buf.writeBigInt64BE(BigInt(size))
    return buf
}

export const infoHash = (torrent: any) =>
    crypto
        .createHash('sha1')
        .update(encode(torrent.info as unknown as BencodeValue))
        .digest()
