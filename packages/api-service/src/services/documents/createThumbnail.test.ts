import { createThumbnail } from '@/services/documents/createThumbnail'
import { FileContentTypeEnum } from 'api-client'
import { join } from 'path'

const createPath = (fileName: string) =>
  join(__dirname, 'fileSamples', fileName)

// this requires ghostscript and graphicsmagick installed on the local machine.
// see the readme for details.
describe.skip('createThumbnail', () => {
  it('can create thumbnail of png', async () => {
    expect(
      await createThumbnail(
        FileContentTypeEnum.ImagePng,
        createPath('sample01.png'),
        createPath('output/sample01-thumbnail-png.png'),
      ),
    ).toBeTruthy()
  })
  it('can create thumbnail of pdf', async () => {
    expect(
      await createThumbnail(
        FileContentTypeEnum.ApplicationPdf,
        createPath('sample01.pdf'),
        createPath('output/sample01-thumbnail-pdf.png'),
      ),
    ).toBeTruthy()
  })
  it('can create thumbnail of tiff', async () => {
    expect(
      await createThumbnail(
        FileContentTypeEnum.ImageTiff,
        createPath('sample01.tiff'),
        createPath('output/sample01-thumbnail-tiff.png'),
      ),
    ).toBeTruthy()
  })
  it('can create thumbnail of jpg', async () => {
    expect(
      await createThumbnail(
        FileContentTypeEnum.ImageJpeg,
        createPath('sample01.jpg'),
        createPath('output/sample01-thumbnail-jpg.png'),
      ),
    ).toBeTruthy()
  })
  it('can create thumbnail of tiff 2', async () => {
    expect(
      await createThumbnail(
        FileContentTypeEnum.ImageTiff,
        createPath('user_experience_style_guide.tiff'),
        createPath('output/user_experience_style_guide-thumbnail-tiff.png'),
      ),
    ).toBeTruthy()
  })
})
