import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBlogArticle } from '@/hooks/useBlog';
import { SEO, generateArticleSchema } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useBlogArticle(slug || '');

  useEffect(() => {
    // Increment view count when article is loaded
    if (article?.slug) {
      supabase.rpc('increment_article_views', { article_slug: article.slug }).catch(
        console.error
      );
    }
  }, [article?.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The article you're looking for doesn't exist.
        </p>
        <Link to="/blog">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  const baseUrl = import.meta.env.VITE_APP_URL || 'https://vaultverse.com';
  const articleUrl = `${baseUrl}/blog/${article.slug}`;
  const articleSchema = generateArticleSchema({
    title: article.title,
    excerpt: article.excerpt,
    author: 'VaultVerse Team',
    publishedAt: article.published_at || article.created_at,
    updatedAt: article.updated_at,
    imageUrl: article.featured_image,
    slug: article.slug,
  });

  return (
    <>
      <SEO
        title={article.title}
        description={article.excerpt || article.title}
        ogType="article"
        ogImage={article.featured_image}
        canonicalUrl={articleUrl}
        publishedTime={article.published_at || article.created_at}
        modifiedTime={article.updated_at}
        schemaMarkup={articleSchema}
        keywords={article.excerpt?.split(' ').slice(0, 10)}
      />

      <div className="min-h-screen bg-background">
        {/* Article Header */}
        <div className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <Link to="/blog">
                <Button variant="ghost" className="mb-6">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Button>
              </Link>

              <h1 className="text-4xl md:text-5xl font-bold mb-6">{article.title}</h1>

              {article.excerpt && (
                <p className="text-xl text-muted-foreground mb-6">{article.excerpt}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {format(
                    new Date(article.published_at || article.created_at),
                    'MMMM d, yyyy'
                  )}
                </div>

                {article.reading_time_minutes && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {article.reading_time_minutes} min read
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {article.views_count} views
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {article.featured_image && (
          <div className="container mx-auto px-6 -mt-8 mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video overflow-hidden rounded-lg shadow-lg">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="container mx-auto px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <article
              className="prose prose-lg prose-slate max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Footer */}
            <div className="mt-12 pt-8 border-t">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Last updated: {format(new Date(article.updated_at), 'MMMM d, yyyy')}
                </div>
                <Link to="/blog">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Blog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="bg-primary/5 py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
              <p className="text-muted-foreground mb-6">
                Get the latest articles and updates delivered to your inbox.
              </p>
              <div className="flex gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
