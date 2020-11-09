<template>
  <div>
    <SharedCollectionList :owner-id="$route.params.ownerid" />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { DocumentListItem, User } from 'api-client'
import { format } from 'date-fns'
import { userStore } from '../../../../plugins/store-accessor'

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
    this.title = this.$t('shared') as string
    // TODO: uncomment when getUser 404 error is fixed
    // const user = (await this.$store.dispatch(
    //   'user/getUser',
    //   this.$route.params.ownerid,
    // )) as User
    // this.title = `${this.$t('sharedBy')} ${user.givenName}`
  }
}
</script>
