---
title: "Tutorial"
date: 2020-12-12T17:38:00-08:00
draft: true
github_repo: "https://github.com/DakotaLMartinez/hugotails"
---

# Setting up TailwindCSS with PostCSS in Hugo

## Initial Setup
First, make a new hugo app:

```bash
hugo new site hugotails
```

Next, create a new theme

```bash
hugo new theme tailwind-theme
```
After we create the theme, we need to tell hugo to use it. To do this, let's update our config.toml file like so:

```toml
baseURL = "http://example.org/"
languageCode = "en-us"
title = "My New Hugo Site"
theme = "tailwind-theme"
```
After the new theme is created and we've told hugo to use it, we'll want to initialize an npm project so we can add our dependencies for managing the css.

## Adding JavaScript Dependencies
```bash
npm init -y
```

Now we want to actually add the dependencies:

```js
"devDependencies": {
  "autoprefixer": "^10.1.0",
  "postcss": "^8.2.1",
  "postcss-cli": "^8.3.1",
  "postcss-import": "^13.0.0",
  "tailwindcss": "^2.0.2"
}
```

These are the versions as of this writing. You can install current versions yourself by running

```bash
npm i --save-dev autoprefixer postcss postcss-cli postcss-import tailwindcss
```

## Configuring Tailwindcss with postCSS

With the dependencies installed, we'll want to set up initial configuration. For this, we'll need to create a couple of directories inside of our theme folder. Then, we'll add 3 files.

```bash
mkdir -p themes/tailwind-theme/assets/css
touch themes/tailwind-theme/assets/css/postcss.config.js
touch themes/tailwind-theme/assets/css/styles.scss
themes/tailwind-theme/assets/css/tailwind.config.js
```

### themes/tailwind-theme/assets/css/postcss.config.js

In the postcss.config.js, we'll need to configure our plugins and tell postcss where the theme directory is. We also want to instruct postcss to use the custom tailwind configurations that we add to our `tailwind.config.js` later on. For now, we're just going to create this file and leave it empty, but we'll definitely be adding to it later. You can read more about [how to customize tailwind](https://tailwindcss.com/docs/configuration) in the offical docs.

```js
// themes/tailwind-theme/assets/css/postcss.config.js
const themeDir = __dirname + '/../../';

module.exports = {
  plugins: [
    require('postcss-import')({
      path: [themeDir]
    }),
    require('tailwindcss')(themeDir + 'assets/css/tailwind.config.js'),
    require('autoprefixer')({
      path: [themeDir]
    })
  ]
}
```

### themes/tailwind-theme/assets/css/styles.scss
Next, we'll import the base, components and utilities modules from tailwindcss in the styles.scss file:

```css
/* themes/tailwind-theme/assets/css/styles.scss */
@import "node_modules/tailwindcss/base";
@import "node_modules/tailwindcss/components";
@import "node_modules/tailwindcss/utilities";
```

### themes/tailwind-theme/assets/css/tailwind.config.js

Finally, we'll finish out the configuration process by adding in the (currently) empty boilerplate for our `tailwind.config.js` file.

```js
// themes/tailwind-theme/assets/css/tailwind.config.js
module.exports = {
  theme: {
    extend: {
      
    }
  },
  variants: {

  },
  plugins: []
}
```

## Testing out Tailwind in our Hugo Templates

To get this working in a way where we can see it in action in our hugo server, we have a few more tasks to complete. I'll talk about a potential gotcha that may come up for newcomers to hugo at the end of this section. First, let's take a look at the files we'll be changing to demonstrate how we add tailwind to our existing hugo templates.

### themes/tailwind-theme/layouts/partials/head.html

In this file, we need to tell hugo about our `styles.scss` file. We also want to make sure it' gets converted to css and then piped through our postcss configuration before being added to the head tag in our html. There's also some conditional logic here indicating that we should minify, fingerprint and run post processing on the stylesheet if we're not using the server currently (it's a production build).

```html
<head>
  {{ $styles := resources.Get "css/styles.scss" | toCSS | 
  postCSS (dict "config" "./assets/css/postcss.config.js") }}

  {{ if .Site.IsServer }}
  <link rel="stylesheet" href="{{ $styles.RelPermalink }}">
  {{ else }}
  {{ $styles := $styles | minify | fingerprint | resources.PostProcess }}
  <link rel="stylesheet" href="{{ $styles.Permalink }}" 
  integrity="{{ $styles.Data.Integrity }}">
  {{ end }}
</head>
```

### themes/tailwind-theme/layouts/partials/header.html

In order to see the effect of the changes we make to our styles by adding tailwind, we'll need to add some tailwind classes to one of our templates. Here, we'll just add some styling to the included header.html template.

```html
<!-- themes/tailwind-theme/layouts/partials/header.html -->
<header class="w-full bg-blue-300 py-4">
  <h1 class="text-center">Welcome to HugoTails!</h1>
</header>
```

We're nearing the moment where we'll be able to see in the browser whether this is working if we run `hugo server -D --watch` (runs our hugo server in development mode and watches for changes in order to rebuild the site and reload the server when we make changes to our code.)

If we do this now, we'll actually see a blank screen, even though we've added this nice header with a blue background. This is the gotcha I referred to earlier and it has to do with another file we need to take a look at.

### themes/tailwind-theme/layouts/_default/baseof.html

If you're new to hugo and theme development, there's a particular part of the code in this file that can cause an issue that I got stuck on for a bit. I'll point it out to you here. By default, your new Hugo theme will have the following file at this location: `themes/tailwind-theme/layouts/_default/baseof.html`. The only change I've made to it is adding a couple of styles to the body tag to give it a dark mode feel.

```html
<!-- themes/tailwind-theme/layouts/_default/baseof.html -->
<!DOCTYPE html>
<html>
  {{- partial "head.html" . -}}
  <body class="bg-gray-800 text-gray-50">
    {{- partial "header.html" . -}}
    <div id="content">
    {{- block "main" . }}{{- end }}
    </div>
    {{- partial "footer.html" . -}}
  </body>
</html>
```
This baseof.html template file is used as the outer shell for every html document generated by the `hugo` command. As such, it's a great place to put any code that you want to be accessible anywhere on your site. Things like styles and scripts are potential candidates here. Also, markup you want to be present everywhere like a header that presents navigation or a footer with company information might find a nice home here.

For beginners, one thing to note is this line.

```html
{{- block "main" . }}{{- end }}
```

The reason I'm drawing attention here is that having a block within `baseof.html` like this means that our templates need to define `main` if hugo is going to actually make use of baseof.

For example, if you have just a bit of html in your index.html file:

```html
<!-- themes/tailwind-theme/layouts/index.html -->
<h1>Hello</h1>
```
Then when you visit the home page, you're just going to see the Hello `<h1>` tag. You won't see the header with the blue background that we added to the `head.html` partial. 

![Hello alone](https://res.cloudinary.com/dnocv6uwb/image/upload/v1607907710/Screen_Shot_2020-12-13_at_4.59.52_PM_avk3cn.png) If we want our templates to work properly, they need to `define "main"` within them so that baseof can be applied as the shell and the template content can be added properly.

```html
{{ define "main" }}
<h1>Hello</h1>
{{ end }}
```

Now, when we load up the home page in the browser, we see that our head partial is now loading the tailwind styles.

![Hello with Tailwind Styles applied](https://res.cloudinary.com/dnocv6uwb/image/upload/v1607907808/Screen_Shot_2020-12-13_at_5.03.41_PM_d7ctvg.png)

You'll notice that after we've done this, the Hello header is no longer large like it was before tailwind styles were applied. 

## Adding plugins to tailwind.config.js

Here is a case where you can test out that the `tailwind.config.js` configuration is working properly. Let's head over there and add some theme configuration for the header sizes.

```js
// themes/tailwind-theme/assets/css/tailwind.config.js
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
        }
      })
    })
  ]
}
```

And after changing this configuration, let's open up the browser again and take a look at what we've got.

![With tailwind config for header font size](https://res.cloudinary.com/dnocv6uwb/image/upload/v1607910217/Screen_Shot_2020-12-13_at_5.43.52_PM_eymbzv.png)

If you want to use hugo's built in stylesheets for syntax highlighting. You can run a command like this:

```bash
hugo gen chromastyles --style=solarized-dark256 > themes/tailwind-theme/assets/css/syntax.css
```
Then, to load these styles, you'll want to update the `head.html` partial

```html
<!-- themes/tailwind-theme/partials/head.html -->
<head>
  {{ $styles := resources.Get "css/styles.scss" | toCSS | postCSS (dict "config" "./assets/css/postcss.config.js") }}
  {{ $syntax := resources.Get "css/syntax.css" | postCSS (dict "config" "./assets/css/postcss.config.js") }}

  {{ if .Site.IsServer }}
  <link rel="stylesheet" href="{{ $styles.RelPermalink }}">
  <link rel="stylesheet" href="{{ $syntax.RelPermalink }}">
  {{ else }}
  {{ $styles := $styles | minify | fingerprint | resources.PostProcess }}
  {{ $syntax := $syntax | minify | fingerprint | resources.PostProcess }}
  <link rel="stylesheet" href="{{ $styles.Permalink }}" integrity="{{ $styles.Data.Integrity }}">
  <link rel="stylesheet" href="{{ $syntax.Permalink }}" integrity="{{ $styles.Data.Integrity }}">
  {{ end }}
</head>
```

