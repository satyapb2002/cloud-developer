import { Jwt } from '../auth/Jwt'
import {  decode } from 'jsonwebtoken'

export function getUserId(header: string): string{
  console.log('authHeader',authHeader)
  const token = getToken(header)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  console.log('jwt',jwt.payload)
  return jwt.payload.sub
}


function getToken(header: string): string {
    if (!header) throw new Error('No authentication header')
  
    if (!header.toLowerCase().startsWith('bearer '))
      throw new Error('Invalid authentication header')
  
    const split = authHeader.split(' ')
    const token = split[1]
  
    return token
}

