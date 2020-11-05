import { extend, configure } from 'vee-validate'
import { required, email, max } from 'vee-validate/dist/rules'
import VueI18n from 'vue-i18n'
import validationMsgs from 'vee-validate/dist/locale/en'

const customMessages = {
  whitelist: 'Must be an approved agency email',
}
const validationMessages = { ...validationMsgs.messages, ...customMessages }

const i18n = new VueI18n({
  locale: 'en',
  messages: {
    en: {
      validations: validationMessages,
    },
    test: {
      validations: {
        email: 'res fi si xsisev irsies sivvliss',
        required: 'mes heisv es liweeliv',
        max: 'heisv sihsiehs ii rsihith smsilsisils',
      },
    },
  },
})
const emailWhitelist = {
  validate(val, whitelist) {
    return !!whitelist.find((domain) => val.endsWith(domain))
  },
}

// configure({
//   // this will be used to generate messages.
//   defaultMessage: (field, values) => {
//     // values._field_ = i18n.t(`fields.${field}`);
//     return i18n.t(`validations.${values._rule_}`, values)
//   },
// })

extend('required', {
  ...required,
  message: (_, values) => i18n.t('validations.required', values),
})
extend('email', {
  ...email,
  message: (_, values) => i18n.t('validations.email', values),
})
extend('emailWhitelist', {
  ...emailWhitelist,
  message: (_, values) => i18n.t('validations.whitelist', values),
})
extend('max', {
  ...max,
  message: (_, values) => i18n.t('validations.max', values),
})
