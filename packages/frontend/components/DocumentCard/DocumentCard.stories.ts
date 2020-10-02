import DocumentCard from './DocumentCard.vue'

export default {
  title: 'Components/DocumentCard'
}

const template = '<DocumentCard :document="document" />'

export const Primary = () => ({
  components: { DocumentCard },
  props: {
    document: {
      default: () => ({
        name: 'Document name',
        id: '1234'
      })
    }
  },
  template
})

export const NoName = () => ({
  components: { DocumentCard },
  props: {
    document: {
      default: () => ({
        name: '',
        id: '1234'
      })
    }
  },
  template
})
