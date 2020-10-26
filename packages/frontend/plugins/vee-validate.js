import { extend, configure } from 'vee-validate'
import { required, email } from 'vee-validate/dist/rules'
import VueI18n from 'vue-i18n'
import validationMessages from 'vee-validate/dist/locale/en'

const i18n = new VueI18n({
  locale: 'en',
  messages: {
    en: {
      validations: validationMessages.messages,
    },
    test: {
      validations: {
        email: 'res fi si xsisev irsies sivvliss',
        required: 'mes heisv es liweeliv',
      },
    },
  },
})

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
