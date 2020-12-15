import { extend } from 'vee-validate'
import { required, email, max, is_not as isNot } from 'vee-validate/dist/rules'

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

export default ({ app }) => {
  extend('required', {
    ...required,
    message: (_, values) => app.i18n.t('validations.required', values),
  })
  extend('email', {
    ...email,
    message: (_, values) => app.i18n.t('validations.email', values),
  })
  extend('emailWhitelist', {
    ...emailWhitelist,
    message: (_, values) => app.i18n.t('validations.whitelist', values),
  })
  extend('max', {
    ...max,
    message: (_, values) => app.i18n.t('validations.max', values),
  })
  extend('is_not', {
    ...isNot,
    message: (_, values) =>
      app.i18n.t('validations.notSameAsUserEmail', values),
  })
}
