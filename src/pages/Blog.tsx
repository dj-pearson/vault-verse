import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useBlogArticles, useBlogCategories } from '@/hooks/useBlog';
import { SEO } from '@/components/SEO';
import { format } from 'date-fns';

export const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: articles, isLoading } = useBlogArticles('published');
  const { data: categories } = useBlogCategories();

  const filteredArticles = articles
    ?.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || article.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at).getTime();
      const dateB = new Date(b.published_at || b.created_at).getTime();
      return dateB - dateA;
    });

  return (
    <>
      <SEO
        title="Blog - Latest Articles & Updates"
        description="Read the latest articles about environment variable management, security best practices, and team collaboration from VaultVerse."
        ogType="website"
        keywords={['blog', 'environment variables', 'security', 'devops', 'secrets management']}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
              <p className="text-xl text-muted-foreground">
                Learn about security, best practices, and product updates
              </p>
            </div>

            {/* Search */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-6 text-lg"
                />
              </div>
            </div>

            {/* Categories */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(null)}
                  size="sm"
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.id)}
                    size="sm"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="container mx-auto px-6 py-12">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading articles...</p>
            </div>
          ) : filteredArticles && filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {filteredArticles.map((article) => (
                <Link key={article.id} to={`/blog/${article.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    {article.featured_image && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={article.featured_image}
                          alt={article.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <h2 className="text-2xl font-bold line-clamp-2">
                        {article.title}
                      </h2>
                    </CardHeader>
                    <CardContent>
                      {article.excerpt && (
                        <p className="text-muted-foreground line-clamp-3 mb-4">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(
                            new Date(article.published_at || article.created_at),
                            'MMM d, yyyy'
                          )}
                        </div>
                        {article.reading_time_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {article.reading_time_minutes} min read
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <Badge variant="secondary">
                          {article.views_count} views
                        </Badge>
                        <div className="flex items-center text-primary font-medium">
                          Read more
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No articles found. Try adjusting your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
