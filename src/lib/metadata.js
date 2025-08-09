import metadataConfig from './metadata.json';

/**
 * Generate metadata object for Next.js pages
 * @param {string} pageKey - The key to identify the page (e.g., 'home', 'about', 'admin_dashboard')
 * @returns {Object} - Next.js metadata object
 */
export function generateMetadata(pageKey) {
  // Get page-specific metadata
  const pageMetadata = metadataConfig[pageKey] || {};
  
  // Get default metadata
  const defaultMetadata = metadataConfig.default || {};
  
  // Merge page metadata with default metadata (page metadata takes precedence)
  const mergedMetadata = {
    ...defaultMetadata,
    ...pageMetadata
  };
  
  // Generate Next.js metadata object
  const metadata = {
    title: mergedMetadata.title,
    description: mergedMetadata.description,
    keywords: mergedMetadata.keywords,
    authors: [{ name: mergedMetadata.author }],
    robots: mergedMetadata.robots,
    openGraph: {
      title: mergedMetadata.title,
      description: mergedMetadata.description,
      type: mergedMetadata.ogType,
      url: mergedMetadata.canonical,
             siteName: 'Avilash Palace',
      images: [
        {
          url: mergedMetadata.ogImage,
          width: 1200,
          height: 630,
          alt: mergedMetadata.ogImageAlt,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: mergedMetadata.twitterCard,
      title: mergedMetadata.title,
      description: mergedMetadata.description,
      images: [mergedMetadata.ogImage],
    },
    alternates: {
      canonical: mergedMetadata.canonical,
    },
    // Additional metadata
    metadataBase: new URL('https://avilashpalace.com'),
    applicationName: 'Avilash Palace',
    category: 'hostel management',
    classification: 'business',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#5bbad5' },
      ],
    },
    manifest: '/manifest.json',
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
  };
  
  return metadata;
}

/**
 * Get metadata for a specific page with error handling
 * @param {string} pageKey - The key to identify the page
 * @returns {Object} - Next.js metadata object
 */
export function getPageMetadata(pageKey) {
  try {
    return generateMetadata(pageKey);
  } catch (error) {
    console.error(`Error generating metadata for page ${pageKey}:`, error);
    // Return default metadata as fallback
    return generateMetadata('default');
  }
}

/**
 * Get available page keys for reference
 * @returns {Array} - Array of available page keys
 */
export function getAvailablePageKeys() {
  return Object.keys(metadataConfig).filter(key => key !== 'default');
}

/**
 * Validate if a page key exists in the metadata configuration
 * @param {string} pageKey - The key to validate
 * @returns {boolean} - True if the key exists, false otherwise
 */
export function isValidPageKey(pageKey) {
  return pageKey in metadataConfig;
}
