<template>
  <v-card rounded class="px-4 py-3 grey-2">
    <div class="d-flex justify-space-between align-center">
      <span class="text-break">{{ delegate.email }}</span>
      <v-btn
        :title="`${$t('navigation.close')}`"
        style="min-height: 32px"
        icon
        class="mx-2"
        @click="onXButton"
      >
        <v-icon>$close</v-icon>
      </v-btn>
    </div>
    <div v-if="isExpired || isInvited" class="d-flex subtitle">
      <span v-if="isInvited">{{ $t('delegateAccess.invitePending') }}</span>
      <template v-else-if="isExpired">
        <span>{{ $t('delegateAccess.inviteExpired') }}</span>
        <v-btn :disabled="loading" text color="primary" @click="resendInvite">
          {{ $t('delegateAccess.resendInvite') }}
        </v-btn>
      </template>
    </div>
    <ConfirmationDialog
      v-model="showRemoveConfirmation"
      title="delegateAccess.removeConfirmationTitle"
      body="delegateAccess.removeConfirmationBody"
      :on-confirm="removeDelegate"
      :loading="loading"
    />
    <ConfirmationDialog
      v-model="showUninviteConfirmation"
      title="delegateAccess.uninviteConfirmationTitle"
      body="delegateAccess.uninviteConfirmationBody"
      :on-confirm="removeDelegate"
      :loading="loading"
    />
  </v-card>
</template>

<script lang="ts">
import {
  UserDelegatedAccess,
  UserDelegatedAccessCreate,
  UserDelegatedAccessStatus,
} from 'api-client'
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component
export default class DelegateCard extends Vue {
  @Prop({ required: true }) delegate: UserDelegatedAccess

  loading = false
  showRemoveConfirmation = false
  showUninviteConfirmation = false

  async removeDelegate() {
    this.loading = true
    await this.$store.dispatch('delegate/delete', this.delegate.id)
    this.$emit('delete')
    this.showRemoveConfirmation = false
    this.showUninviteConfirmation = false
    this.loading = false
  }

  async resendInvite() {
    this.loading = true
    await this.$store.dispatch('user/delegateAccess', {
      email: this.delegate.email,
    } as UserDelegatedAccessCreate)
    this.$emit('resend')
    this.loading = false
  }

  get isExpired() {
    return this.delegate.status === UserDelegatedAccessStatus.INVITATIONEXPIRED
  }

  get isInvited() {
    return this.delegate.status === UserDelegatedAccessStatus.INVITATIONSENT
  }

  get isActiveDelegate() {
    return this.delegate.status === UserDelegatedAccessStatus.ACTIVE
  }

  onXButton() {
    if (this.isInvited) {
      this.showUninviteConfirmation = true
    } else if (this.isActiveDelegate) {
      this.showRemoveConfirmation = true
    } else {
      this.removeDelegate()
    }
  }
}
</script>

<style scoped lang="scss">
#__nuxt .subtitle {
  span {
    font-size: 0.75rem;
    color: var(--grey-6);
  }
  min-height: 1rem;
  .v-btn {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    min-height: 1.1rem;
    font-size: 0.75rem;
    height: 1.1rem;
  }
}
</style>
