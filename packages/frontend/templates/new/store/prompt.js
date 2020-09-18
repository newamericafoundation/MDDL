module.exports = [
  {
    type: 'input',
    name: 'name',
    message: 'Module name:',
    validate(value) {
      if (!value.length) {
        return 'Store modules must have a name.'
      }
      return true
    },
  },
]
