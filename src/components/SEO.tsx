import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SEOProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  schemaMarkup?: object;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonicalUrl,
  noIndex = false,
  noFollow = false,
  schemaMarkup,
  keywords,
  author,
  publishedTime,
  modifiedTime,
}) => {
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://vaultverse.com';

  useEffect(() => {
    // Fetch global SEO settings
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('seo_settings')
        .select('*')
        .single();
      setSiteSettings(data);
    };
    fetchSettings();
  }, []);

  const siteName = siteSettings?.site_name || 'VaultVerse';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || siteSettings?.site_description || 'Secure environment variable management for teams';
  const defaultOgImage = siteSettings?.default_og_image || `${baseUrl}/og-image.png`;

  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      {author && <meta name="author" content={author} />}
      <meta name="robots" content={robotsContent} />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph Tags */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || metaDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || ogTitle || fullTitle} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || metaDescription} />
      <meta name="twitter:image" content={twitterImage || ogImage || defaultOgImage} />

      {/* Structured Data (JSON-LD) */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}

      {/* Organization Schema (default) */}
      {!schemaMarkup && siteSettings?.structured_data_organization && (
        <script type="application/ld+json">
          {JSON.stringify(siteSettings.structured_data_organization)}
        </script>
      )}
    </Helmet>
  );
};

// Helper function to generate article schema
export const generateArticleSchema = (article: {
  title: string;
  excerpt?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  imageUrl?: string;
  slug: string;
}) => {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://vaultverse.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Person',
      name: article.author || 'VaultVerse Team',
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    image: article.imageUrl || `${baseUrl}/og-image.png`,
    publisher: {
      '@type': 'Organization',
      name: 'VaultVerse',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${article.slug}`,
    },
  };
};

// Helper function to generate breadcrumb schema
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

// Helper function to generate FAQ schema
export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};
