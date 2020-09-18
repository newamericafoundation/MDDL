module.exports = [
  {
    type: 'input',
    name: 'name',
    message: 'Name:',
    validate(value) {
      if (!value.length) {
        return 'Utility modules must have a name.'
      }
      return true
    },
  },
]
