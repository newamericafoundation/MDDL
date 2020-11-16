export default function download(
  urls: string | string[],
  filenames?: string | string[],
) {
  urls = Array.isArray(urls) ? urls : [urls]
  if (filenames) filenames = Array.isArray(filenames) ? filenames : [filenames]
  if (filenames?.length !== urls.length) filenames = undefined

  const link = document.createElement('a')
  for (let i = 0; i < urls.length; i++) {
    link.href = urls[i]
    if (filenames) link.download = filenames[i]
    link.click()
    URL.revokeObjectURL(link.href)
  }
  link.remove()
}
