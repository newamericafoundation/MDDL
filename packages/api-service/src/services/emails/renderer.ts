import { render } from 'mustache'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// set this to true to save the html files locally so they can be inspected for testing
const WRITE_FILES = false

export const templatePath = 'templates'

const loadedTemplates: { [index: string]: string } = {}

export const writeSnapshotFile = (
  name: string,
  content: string | undefined,
) => {
  if (WRITE_FILES) {
    writeFileSync(join(__dirname, '__snapshots__', name + '.html'), content)
  }
}

const loadTemplate = (templateName: string) => {
  if (!loadedTemplates[templateName]) {
    const templateResolvedPath = join(
      __dirname,
      templatePath,
      `${templateName}.mustache`,
    )
    if (!existsSync(templateResolvedPath)) {
      throw new Error(`${templateName} not found`)
    }
    loadedTemplates[templateName] = readFileSync(templateResolvedPath, 'utf8')
  }
  return loadedTemplates[templateName]
}

const partials = {
  header: loadTemplate('header'),
  footer: loadTemplate('footer'),
  horizontalRule: loadTemplate('horizontalRule'),
}

export const renderTemplate = (template: string, data: any) => {
  return render(loadTemplate(template), data, partials)
}
