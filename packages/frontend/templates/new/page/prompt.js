module.exports = [
  {
    type: 'input',
    name: 'name',
    message: 'Name:',
    validate(value) {
      if (!value.length) {
        return 'Pages must have a name.'
      }
      return true
    },
  },
  {
    type: 'confirm',
    name: 'useStyles',
    message: 'Add <style> block?',
  },
]
