import type { SiteConfig } from '~/types'

const config: SiteConfig = {
  site: 'https://blog.macondo.cc',
  title: 'Macondo',
  description:
    '不定期更新的博客',
  author: 'L',
  tags: ['macondo.cc', 'L', 'Blog', 'Astro', 'macondo'],
  socialCardAvatarImage: './src/content/avatar.jpg',
  // Font imported from @fontsource or elsewhere, used for the entire site.
  // To change this see src/styles/global.css and import a different font.
  font: 'JetBrains Mono Variable',
  pageSize: 6,
  // Whether Astro should resolve trailing slashes in URLs or not.
  // This value is used in the astro.config.mjs file and in the "Search" component to make sure pagefind links match this setting.
  // It is not recommended to change this, since most links existing in the site currently do not have trailing slashes.
  trailingSlashes: false,
  // The navigation links to display in the header.
  navLinks: [
    {
      name: 'Home',
      url: '/',
    },
    {
      name: 'About',
      url: '/about',
    },
    {
      name: 'Archive',
      url: '/posts',
    },
    {
      name: 'Sports Notes',
      url: 'https://sports.macondo.cc/',
    },
    {
      name: 'RSS',
      url: '/rss.xml',
    },
  ],
  themes: {
    // The theming mode. One of "single" | "select" | "light-dark-auto".
    mode: 'select',
    default: 'vitesse-dark',
    include: [
      // 'andromeeda',
      // 'aurora-x',
      // 'ayu-dark',
      // 'catppuccin-frappe',
      // 'catppuccin-latte',
      // 'catppuccin-macchiato',
      // 'catppuccin-mocha',
      // 'dark-plus',
      // 'dracula',
      // 'dracula-soft',
      'everforest-dark',
      // 'everforest-light',
      // 'github-dark',
      // 'github-dark-default',
      // 'github-dark-dimmed',
      // 'github-dark-high-contrast',
      // 'github-light',
      // 'github-light-default',
      // 'github-light-high-contrast',
      // 'gruvbox-dark-hard',
      // 'gruvbox-dark-medium',
      // 'gruvbox-dark-soft',
      // 'gruvbox-light-hard',
      // 'gruvbox-light-medium',
      // 'gruvbox-light-soft',
      // 'houston',
      // 'kanagawa-dragon',
      // 'kanagawa-lotus',
      // 'kanagawa-wave',
      // 'laserwave',
      'light-plus',
      // 'material-theme',
      // 'material-theme-darker',
      'material-theme-lighter',
      // 'material-theme-ocean',
      // 'material-theme-palenight',
      // 'min-dark',
      'min-light',
      // 'monokai',
      'night-owl',
      'nord',
      // 'one-dark-pro',
      // 'one-light',
      'plastic',
      'poimandres',
      // 'red',
      // 'rose-pine',
      // 'rose-pine-dawn',
      // 'rose-pine-moon',
      // 'slack-dark',
      // 'slack-ochin',
      'snazzy-light',
      // 'solarized-dark',
      'solarized-light',
      // 'synthwave-84',
      // 'tokyo-night',
      // 'vesper',
      'vitesse-black',
      'vitesse-dark',
      'vitesse-light',
    ],
    // Optional overrides for specific themes to customize colors.
    // Their values can be either a literal color (hex, rgb, hsl) or another theme key.
    // See themeKeys list in src/types.ts for available keys to override and reference.
    overrides: {
      // Improve readability for aurora-x theme
      // 'aurora-x': {
      //   background: '#292929FF',
      //   foreground: '#DDDDDDFF',
      //   warning: '#FF7876FF',
      //   important: '#FF98FFFF',
      //   note: '#83AEFFFF',
      // },
      // Make the GitHub dark theme a little cuter
      // 'github-light': {
      //   accent: 'magenta',
      //   heading1: 'magenta',
      //   heading2: 'magenta',
      //   heading3: 'magenta',
      //   heading4: 'magenta',
      //   heading5: 'magenta',
      //   heading6: 'magenta',
      //   separator: 'magenta',
      //   link: 'list',
      // },
    },
  },
  socialLinks: {
    // github: '',
    // mastodon: '',
    // email: '',
    // linkedin: '',
   // bluesky: '',
    // twitter: '',
    // rss: true,
  },
  giscus: {
    repo: '',
    repoId: '',
    category: '',
    categoryId: '',
    reactionsEnabled: false, 
  },
  characters: {
    owl: '/owl.webp',
    unicorn: '/unicorn.webp',
    duck: '/duck.webp',
  },
}

export default config
