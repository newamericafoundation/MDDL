<template>
  <v-window v-model="step">
    <v-window-item value="top-level">
      <v-toolbar flat>
        <BackButton />
        <v-toolbar-title>{{ $t('navigation.account') }}</v-toolbar-title>
      </v-toolbar>
      <div class="window-container ma-8">
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
        <v-divider />
        <v-btn
          text
          width="100%"
          class="font-weight-bold"
          append-icon="chevron-right"
          @click="step = 'language'"
        >
          {{ $t('account.language') }}
          <v-spacer />
          <v-icon small class="mx-1">$chevron-right</v-icon>
        </v-btn>
        <v-divider />
        <v-footer v-if="userStore.profile" fixed class="pa-8">
          <v-card
            outlined
            :class="[
              $vuetify.breakpoint.xs ? 'full-width' : '',
              'grey-2--text',
              'px-4',
            ]"
          >
            <v-row align="center">
              <v-col cols="2" sm="auto">
                <v-icon large>$profile</v-icon>
              </v-col>
              <v-col cols="10" sm="" class="grey-8--text">
                <p v-text="accountName" />
                <p class="mb-0" v-text="accountEmail" />
              </v-col>
            </v-row>
          </v-card>
        </v-footer>
      </div>
    </v-window-item>
    <v-window-item value="language">
      <v-toolbar flat>
        <v-btn icon @click="step = 'top-level'">
          <v-icon>$chevron-left</v-icon>
        </v-btn>
        <v-toolbar-title>{{ $t('account.language') }}</v-toolbar-title>
      </v-toolbar>
      <div class="window-container ma-8">
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
      <v-toolbar flat>
        <v-btn icon @click="step = 'top-level'">
          <v-icon>$chevron-left</v-icon>
        </v-btn>
        <v-toolbar-title>{{ $t('delegateAccess.pageTitle') }}</v-toolbar-title>
      </v-toolbar>
      <div class="window-container ma-8">
        <ValidationObserver ref="observer">
          <v-form @submit.prevent>
            <ValidationProvider
              v-slot="{ errors, valid }"
              mode="eager"
              name="email"
              rules="required|email|max:255"
            >
              <v-text-field
                v-model="email"
                :disabled="delegates.length >= 10"
                :error-messages="
                  delegates.length >= 10
                    ? [capitalize($tc('delegateAccess.tooManyDelegates', 10))]
                    : errors
                "
                outlined
                :placeholder="capitalize($t('delegateAccess.emailPlaceholder'))"
                type="email"
              />
              <v-row justify="end">
                <v-col cols="auto" class="pb-1">
                  <v-btn
                    class="body-1 font-weight-medium"
                    color="primary"
                    :disabled="!valid || delegates.length >= 10"
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
          :key="i"
          :delegate="delegate"
          @delete="loadDelegates"
        />
        <v-divider
          v-if="activeDelegates.length && pendingOrExpiredDelegates.length"
          class="full-width my-5"
        />
        <DelegateCard
          v-for="(delegate, i) in pendingOrExpiredDelegates"
          :key="i"
          :delegate="delegate"
          @delete="loadDelegates"
        />
      </div>
      <ConfirmationDialog
        v-model="showConfirmation"
        title="delegateAccess.addConfirmationTitle"
        body="delegateAccess.addConfirmationBody"
        :on-confirm="confirmDelegate"
        :loading="loading"
      />
    </v-window-item>
  </v-window>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { capitalize } from '@/assets/js/stringUtils'
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
      title: capitalize(this.$t('navigation.account') as string),
    }
  },
})
export default class Account extends Vue {
  capitalize = capitalize

  step = 'top-level'
  email = ''
  delegates: UserDelegatedAccess[] = []
  maxDelegates = 1 // possibly want multiple delegates in a future iteration
  recompute = false
  showConfirmation = false
  loading = false
  userStore = userStore

  get accountName() {
    return userStore.profile
      ? `${userStore.profile.givenName} ${userStore.profile.familyName}`
      : ''
  }

  get accountEmail() {
    return `${this.$auth.user.email}`
  }

  get activeDelegates() {
    return this.delegates.filter(
      d => d.status === UserDelegatedAccessStatus.ACTIVE,
    )
  }

  get pendingOrExpiredDelegates() {
    return this.delegates.filter(d =>
      [
        UserDelegatedAccessStatus.INVITATIONSENT,
        UserDelegatedAccessStatus.INVITATIONEXPIRED,
      ].includes(d.status),
    )
  }

  mounted() {
    this.loadDelegates()
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
      .then(delegates => (this.delegates = delegates))
  }
}
</script>

<style lang="scss" scoped>
.v-card.full-width {
  width: 100%;
}
</style>
