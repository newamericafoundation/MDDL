import { FILE_CONTENT_TYPE } from './constants'

describe('constants', () => {
  it('has correct FILE_CONTENT_TYPE', () => {
    expect(FILE_CONTENT_TYPE).toMatchInlineSnapshot(`
      Map {
        "ApplicationPdf" => "application/pdf",
        "ImageJpeg" => "image/jpeg",
        "ImagePng" => "image/png",
        "ImageTiff" => "image/tiff",
      }
    `)
  })
})
