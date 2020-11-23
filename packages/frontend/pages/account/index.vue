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
                <v-col cols="auto">
                  <v-btn
                    class="body-1 mb-4 font-weight-medium"
                    color="primary"
                    :disabled="!valid || delegates.length >= 10"
                    @click="
                      showConfirmation = true
                      confirmationType = 0
                    "
                  >
                    {{ $t('controls.add') }}
                  </v-btn>
                </v-col>
              </v-row>
            </ValidationProvider>
          </v-form>
        </ValidationObserver>

        <v-divider class="full-width mb-8" />
        <v-card
          v-for="(delegate, i) in delegates"
          :key="i"
          rounded
          class="px-4 py-1 mb-2 grey-2"
        >
          <v-row align="center" no-gutters>
            <v-col>
              <span>{{ delegate.email }}</span>
            </v-col>
            <v-col cols="auto">
              <v-btn
                icon
                @click="
                  showConfirmation = true
                  delegateToRemove = delegate
                  confirmationType = 1
                "
              >
                <v-icon>$close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </div>
      <v-dialog v-model="showConfirmation" width="350">
        <v-card>
          <v-row class="py-4">
            <v-btn
              absolute
              right
              icon
              :disabled="loading"
              @click="showConfirmation = false"
            >
              <v-icon>$close</v-icon>
            </v-btn>
            <br />
          </v-row>
          <v-card-title class="text-heading-1 mx-2">
            {{
              capitalize(
                confirmationType === 0
                  ? $t('delegateAccess.addConfirmationTitle')
                  : $t('delegateAccess.removeConfirmationTitle'),
              )
            }}
          </v-card-title>

          <v-card-text class="ma-2">
            {{
              capitalize(
                confirmationType === 0
                  ? $t('delegateAccess.addConfirmationBody')
                  : $t('delegateAccess.removeConfirmationBody'),
              )
            }}
          </v-card-text>

          <v-card-actions class="px-8 pb-8">
            <v-spacer></v-spacer>
            <v-btn :disabled="loading" @click="showConfirmation = false">
              {{ capitalize($t('controls.cancel')) }}
            </v-btn>
            <v-btn
              color="primary"
              :loading="loading"
              @click="
                () =>
                  confirmationType === 0 ? confirmDelegate() : removeDelegate()
              "
            >
              {{ capitalize($t('controls.confirm')) }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-window-item>
  </v-window>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { capitalize } from '@/assets/js/stringUtils'
import { snackbarStore, userStore } from '@/plugins/store-accessor'
import { UserDelegatedAccess } from 'api-client'

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
  confirmationType = 0 // 0: add, 1: remove
  delegateToRemove: UserDelegatedAccess | null = null
  userStore = userStore

  get accountName() {
    return userStore.profile
      ? `${userStore.profile.givenName} ${userStore.profile.familyName}`
      : ''
  }

  get accountEmail() {
    return `${this.$auth.user.email}`
  }

  mounted() {
    this.loadDelegates()
  }

  async removeDelegate() {
    this.loading = true
    await this.$store.dispatch('delegate/delete', this.delegateToRemove!.id)
    await this.loadDelegates()
    this.loading = false
    this.showConfirmation = false
    this.delegateToRemove = null
  }

  async confirmDelegate() {
    this.loading = true
    await this.$store.dispatch('user/delegateAccess', {
      email: this.email,
    })
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
