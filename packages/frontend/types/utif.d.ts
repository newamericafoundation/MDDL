import { IFD } from 'utif'

declare module 'utif' {
  export function decodeImage(
    buffer: Buffer | ArrayBuffer,
    ifd: IFD,
    ifds: IFD[],
  ): void
}
