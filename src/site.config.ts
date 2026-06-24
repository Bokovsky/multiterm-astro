import type { SiteConfig } from '~/types'

const config: SiteConfig = {
  site: 'https://blog.macondo.cc',
  title: 'Macondo',
  description: '不定期更新的博客，分享技术学习和生活随笔',
  author: 'EDTA',
  tags: ['macondo.cc', 'EDTA', 'Blog', 'Astro', 'macondo'],
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
      name: 'Me',
      url: '/me',
    },
    {
      name: 'Archive',
      url: '/posts',
    },
    {
      name: 'Now',
      url: '/now',
    },
  ],
  themes: {
    // The theming mode. One of "single" | "select" | "light-dark-auto".
    mode: 'select',
    default: 'vitesse-dark',
    include: ['vitesse-dark', 'vitesse-light'],
    overrides: {
      'vitesse-dark': {
        background: '#0f131c',
        bounceLight: '#1b293f',
        shadow: '#030307',
      },
      'vitesse-light': {
        background: '#fffdfa',
        bounceLight: '#f5d7a6',
        shadow: '#1a1917',
      },
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
  characters: {
    owl: '/owl.webp',
    unicorn: '/unicorn.webp',
    duck: '/duck.webp',
  },
  inaturalist: {
    username: 'edta2na',
    limit: 10,
  },
}

export default config
