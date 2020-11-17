<template>
  <v-window v-model="step">
    <v-window-item value="top-level">
      <v-toolbar flat>
        <BackButton />
        <v-toolbar-title>{{ $t('navigation.account') }}</v-toolbar-title>
      </v-toolbar>
      <div class="window-container mx-8">
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
      </div>
    </v-window-item>
    <v-window-item value="language">
      <v-toolbar flat>
        <v-btn icon @click="step = 'top-level'">
          <v-icon>$chevron-left</v-icon>
        </v-btn>
        <v-toolbar-title>{{ $t('account.language') }}</v-toolbar-title>
      </v-toolbar>
      <div class="window-container mx-8">
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
      <div class="window-container mx-8">
        <ValidationObserver ref="observer">
          <v-form @submit.prevent>
            <ValidationProvider
              v-slot="{ errors }"
              mode="eager"
              name="email"
              rules="required|email|max:255"
            >
              <v-text-field
                v-model="email"
                :error-messages="errors"
                outlined
                :placeholder="capitalize($t('delegateAccess.emailPlaceholder'))"
                type="email"
                :disabled="delegateEmails.length >= maxDelegates"
                @keydown.enter="addEmail"
                @blur="addEmail"
              />
            </ValidationProvider>
          </v-form>
        </ValidationObserver>
        <v-row justify="end">
          <v-col cols="auto">
            <v-btn
              class="body-1 mb-4 font-weight-medium"
              color="primary"
              :disabled="!delegateEmails.length"
              @click="showConfirmation = true"
            >
              {{ $t('controls.add') }}
            </v-btn>
          </v-col>
        </v-row>
        <v-divider class="full-width mb-8" />
        <v-card
          v-for="(email, i) in delegateEmails"
          :key="i"
          rounded
          class="px-4 py-1 mb-2 grey-2"
        >
          <v-row align="center" no-gutters>
            <v-col>
              <span>{{ email }}</span>
            </v-col>
            <v-col cols="auto">
              <v-btn icon @click="removeEmail(i)">
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
          <v-card-title class="heading-1 mx-2">
            {{ capitalize($t('delegateAccess.confirmationTitle')) }}
          </v-card-title>

          <v-card-text class="ma-2">
            {{ $t('delegateAccess.confirmationBody') }}
          </v-card-text>

          <v-card-actions class="px-8 pb-8">
            <v-spacer></v-spacer>
            <v-btn :disabled="loading" @click="showConfirmation = false">
              {{ capitalize($t('controls.cancel')) }}
            </v-btn>
            <v-btn color="primary" :disabled="loading" @click="confirmDelegate">
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
import { snackbarStore } from '@/plugins/store-accessor'

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
  delegateEmails: string[] = []
  maxDelegates = 1 // possibly want multiple delegates in a future iteration
  recompute = false
  showConfirmation = false
  loading = false

  get emailInputValid() {
    // Referencing this.recompute forces this.$refs.observer to be updated
    // eslint-disable-next-line no-unused-expressions
    this.recompute
    return this.$refs.observer instanceof ValidationObserver
      ? (this.$refs.observer as any).fields.email.valid || this.email === ''
      : false
  }

  async addEmail(evt: KeyboardEvent | FocusEvent) {
    await (this.$refs.observer as any).validate()
    if (this.emailInputValid && this.email.length) {
      const email = this.email
      this.email = ''
      // unfortunately nextTick won't do the trick here
      setTimeout(() => (this.$refs.observer as any).reset(), 50)
      if (!this.delegateEmails.includes(email)) this.delegateEmails.push(email)
    }
  }

  removeEmail(index: number) {
    this.delegateEmails.splice(index, 1)
  }

  async confirmDelegate() {
    this.loading = true
    await this.$store.dispatch('user/delegateAccess', {
      email: this.delegateEmails[0],
    })
    this.$router.push('/dashboard')
  }
}
</script>
