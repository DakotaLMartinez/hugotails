const plugin = require('tailwindcss/plugin')

module.exports = {
  theme: {
    extend: {

    }
  },
  variants: {

  },
  plugins: [
    plugin(function({ addBase, config }) {
      addBase({
        'h1': { 
          fontSize: config('theme.fontSize.3xl'), 
          marginTop: config('theme.spacing.6'),
          marginBottom: config('theme.spacing.6'),
          fontWeight: config('theme.fontWeight.semibold')
        },
        'h2': { 
          fontSize: config('theme.fontSize.2xl'), 
          marginTop: config('theme.spacing.4'),
          marginBottom: config('theme.spacing.4'),
          fontWeight: config('theme.fontWeight.semibold')
        },
        'h3': { 
          fontSize: config('theme.fontSize.xl'), 
          marginTop: config('theme.spacing.3'),
          marginBottom: config('theme.spacing.3'),
          fontWeight: config('theme.fontWeight.semibold') 
        },
        'h4': {
          fontSize: config('theme.fontSize.lg'), 
          marginTop: config('theme.spacing.2'),
          marginBottom: config('theme.spacing.2'),
          fontWeight: config('theme.fontWeight.semibold')
        },
        'pre': {
          paddingLeft: config('theme.spacing.4'),
          paddingRight: config('theme.spacing.4'),
          paddingBottom: config('theme.spacing.7'),
          paddingTop: config('theme.spacing.7'),
          marginTop: config('theme.spacing.6'),
          marginBottom: config('theme.spacing.6'),
          position: 'relative'
        }
      })
    })
  ]
}