<template>
  <div class="container">
    <div class="font-weight-bold subtitle-2">
      {{ $t('agent.dateShared') }}
    </div>
    <div class="font-weight-thin subtitle-2 grey-7--text mb-4">
      {{ sharedDate }}
    </div>
    <div class="font-weight-bold subtitle-2">
      {{ $t('agent.sharedBy') }}
    </div>
    <div class="font-weight-thin subtitle-2 grey-7--text" :title="sharerName">
      {{ sharerName }}
    </div>
    <div
      v-if="sharerEmail !== sharerName"
      class="font-weight-thin subtitle-2 grey-7--text email"
      :title="sharerEmail"
    >
      {{ sharerEmail }}
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { SharedCollectionListItem } from '@/types/transformed'
import { format } from 'date-fns'

@Component
export default class SharedCollectionDetails extends Vue {
  @Prop({ required: true }) collection: SharedCollectionListItem

  get sharedDate() {
    return this.collection
      ? format(
          new Date(this.collection.shareInformation.sharedDate),
          'LLL d, yyyy - k:mm',
        )
      : ''
  }

  get sharerName() {
    return this.collection ? this.collection.shareInformation.sharedBy.name : ''
  }

  get sharerEmail() {
    return this.collection
      ? this.collection.shareInformation.sharedBy.email
      : ''
  }
}
</script>

<style scoped lang="scss">
.email {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
