import { FileContentTypeMap } from './constants'

describe('constants', () => {
  it('has correct FileContentTypeMap', () => {
    expect(FileContentTypeMap).toMatchInlineSnapshot(`
      Map {
        "ApplicationPdf" => "application/pdf",
        "ImageJpeg" => "image/jpeg",
        "ImagePng" => "image/png",
        "ImageTiff" => "image/tiff",
      }
    `)
  })
})
