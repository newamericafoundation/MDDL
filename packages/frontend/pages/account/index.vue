<template>
  <div class="d-flex mt-4 justify-center">
    <AppBar :empty="true" :title="toolbarTitle">
      <template v-slot:nav-action>
        <BackButton v-if="step === 'top-level'" tabindex="0" class="mt-1" />
        <v-btn
          v-else
          :title="`${$t('navigation.back')}`"
          icon
          @click="step = 'top-level'"
        >
          <v-icon small class="mt-1">$chevron-left</v-icon>
        </v-btn>
      </template>
    </AppBar>
    <v-window v-model="step" touchless class="pa-8 mt-8">
      <v-window-item value="top-level">
        <div class="window-container mx-auto">
          <v-btn
            text
            width="100%"
            class="font-weight-bold"
            @click="step = 'delegate'"
          >
            {{ $t('delegateAccess.menuTitle') }}
            <v-spacer />
            <v-icon small class="mx-1">$chevron-right</v-icon>
          </v-btn>
          <v-divider class="my-0" />
          <template v-if="$i18n.locales.length > 1">
            <v-btn
              text
              width="100%"
              class="font-weight-bold"
              @click="step = 'language'"
            >
              {{ $t('account.language') }}
              <v-spacer />
              <v-icon small class="mx-1">$chevron-right</v-icon>
            </v-btn>
            <v-divider class="my-0" />
          </template>
          <v-footer v-if="userStore.profile" fixed class="pa-8">
            <v-card
              outlined
              :class="[
                $vuetify.breakpoint.xs ? 'full-width' : '',
                'grey-2--text',
                'px-6 py-2',
              ]"
            >
              <v-row align="center">
                <v-col cols="12" sm="" class="grey-8--text">
                  <p
                    v-if="!accountEmailIsName"
                    class="font-weight-bold mb-0"
                    v-text="accountName"
                  />
                  <p class="mb-0" v-text="accountEmail" />
                </v-col>
              </v-row>
            </v-card>
          </v-footer>
        </div>
      </v-window-item>
      <v-window-item value="language">
        <div class="window-container mx-auto">
          <v-select
            v-if="$i18n"
            v-model="$i18n.locale"
            :items="$i18n.locales"
            :label="$t('account.language')"
            class="mt-4"
            dense
          />
        </div>
      </v-window-item>
      <v-window-item value="delegate">
        <div class="window-container mx-auto">
          <ValidationObserver ref="observer">
            <v-form @submit.prevent>
              <ValidationProvider
                v-slot="{ errors, valid }"
                mode="eager"
                name="email"
                :rules="`email|max:255|is_not:${accountEmail}`"
              >
                <v-text-field
                  v-model="email"
                  :disabled="delegates.length >= 10"
                  :error-messages="
                    delegates.length >= 10
                      ? [$tc('delegateAccess.tooManyDelegates', 10)]
                      : errors
                  "
                  outlined
                  :placeholder="$t('delegateAccess.emailPlaceholder')"
                  type="email"
                />
                <v-row justify="end">
                  <v-col cols="auto" class="pb-1">
                    <v-btn
                      class="body-1 font-weight-medium"
                      color="primary"
                      :disabled="
                        !valid || delegates.length >= 10 || email.length === 0
                      "
                      @click="showConfirmation = true"
                    >
                      {{ $t('controls.add') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </ValidationProvider>
            </v-form>
          </ValidationObserver>

          <v-divider class="full-width my-5" />
          <DelegateCard
            v-for="(delegate, i) in activeDelegates"
            :key="`active-${i}`"
            :delegate="delegate"
            @delete="loadDelegates"
          />
          <v-divider
            v-if="activeDelegates.length && pendingOrExpiredDelegates.length"
            class="full-width my-5"
          />
          <DelegateCard
            v-for="(delegate, i) in pendingOrExpiredDelegates"
            :key="`pending-${i}`"
            :delegate="delegate"
            @delete="loadDelegates"
            @resend="loadDelegates"
          />
        </div>
        <ConfirmationDialog
          v-model="showConfirmation"
          title="delegateAccess.addConfirmationTitle"
          body="delegateAccess.addConfirmationBody"
          confirm-label="delegateAccess.addConfirmationAction"
          :on-confirm="confirmDelegate"
          :loading="loading"
        />
      </v-window-item>
      <FooterLinks />
    </v-window>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ValidationObserver, ValidationProvider } from 'vee-validate'

import { snackbarStore, userStore } from '@/plugins/store-accessor'
import {
  UserDelegatedAccess,
  UserDelegatedAccessCreate,
  UserDelegatedAccessStatus,
} from 'api-client'

@Component({
  layout: 'empty',
  components: {
    ValidationObserver,
    ValidationProvider,
  },
  head() {
    return {
      title: this.$t('navigation.account') as string,
    }
  },
})
export default class Account extends Vue {
  step = 'top-level'
  email = ''
  delegates: UserDelegatedAccess[] = []
  recompute = false
  showConfirmation = false
  loading = false
  userStore = userStore

  mounted() {
    this.loadDelegates()
  }

  get toolbarTitle() {
    switch (this.step) {
      case 'top-level':
        return 'navigation.account'
      case 'language':
        return 'account.language'
      case 'delegate':
        return 'delegateAccess.pageTitle'
      default:
        return 'navigation.account'
    }
  }

  get accountName() {
    return userStore.profile ? userStore.profile.name : ''
  }

  get accountEmail() {
    return userStore.profile ? userStore.profile.email : ''
  }

  get accountEmailIsName() {
    return this.accountName === this.accountEmail
  }

  get activeDelegates() {
    return this.delegates.filter(
      (d) => d.status === UserDelegatedAccessStatus.ACTIVE,
    )
  }

  get pendingOrExpiredDelegates() {
    return this.delegates.filter((d) =>
      [
        UserDelegatedAccessStatus.INVITATIONSENT,
        UserDelegatedAccessStatus.INVITATIONEXPIRED,
      ].includes(d.status),
    )
  }

  async confirmDelegate() {
    this.loading = true
    await this.$store.dispatch('user/delegateAccess', {
      email: this.email,
    } as UserDelegatedAccessCreate)
    await this.loadDelegates()
    this.$nextTick(() => (this.$refs.observer as any).reset())
    this.email = ''
    this.showConfirmation = false
    this.loading = false
  }

  loadDelegates() {
    return this.$store
      .dispatch('user/fetchDelegates')
      .then((delegates) => (this.delegates = delegates))
  }
}
</script>

<style lang="scss" scoped>
.v-card.full-width {
  width: 100%;
}

.v-window {
  width: 100%;
}

.window-container {
  max-width: 598px;
  width: 100%;
}
</style>
