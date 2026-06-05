import crypto from 'node:crypto'

export const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex')
export const randomToken = (len = 48) => crypto.randomBytes(len).toString('hex')

