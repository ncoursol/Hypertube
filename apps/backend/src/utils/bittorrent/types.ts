export interface Peer {
    ip: string
    port: number
}

export interface BlockStatus {
    status: 'REQUESTED' | 'RECEIVED' | 'NEEDED'
    data: Buffer | null
}

export interface Block {
    pieceIndex: number
    length: number
    begin: number
    delayed?: boolean
}

export const BLOCK_LEN = 1 << 14

export interface File {
    path: string
    length: number
    fd: number
}
