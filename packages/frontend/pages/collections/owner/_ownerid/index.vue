<template>
  <div>
    <SharedCollectionList :owner-id="$route.params.ownerid" />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { DocumentListItem, User } from 'api-client'
import { format } from 'date-fns'
import { userStore } from '@/plugins/store-accessor'

@Component({
  head() {
    return {
      title: (this as OwnerCollections).title,
    }
  },
})
export default class OwnerCollections extends Vue {
  title = ''

  mounted() {
    if (userStore.profile) {
      this.title = `${this.$t('tabTitles.sharedBy')} ${
        userStore.profile.givenName
      }`
    } else {
      this.title = this.$t('tabTitles.shared') as string
    }
  }
}
</script>
