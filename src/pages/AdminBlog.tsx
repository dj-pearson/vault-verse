import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBlogArticles, useDeleteBlogArticle } from '@/hooks/useBlog';
import { BlogEditor } from '@/components/blog/BlogEditor';
import { format } from 'date-fns';

export const AdminBlog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { data: articles, isLoading } = useBlogArticles();
  const deleteArticle = useDeleteBlogArticle();

  const filteredArticles = articles?.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      await deleteArticle.mutateAsync(id);
    }
  };

  const handleEdit = (id: string) => {
    setSelectedArticle(id);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setSelectedArticle(null);
    setIsEditorOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      published: 'default',
      draft: 'secondary',
      archived: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage blog articles
          </p>
        </div>
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedArticle ? 'Edit Article' : 'Create New Article'}
              </DialogTitle>
            </DialogHeader>
            <BlogEditor
              articleId={selectedArticle || undefined}
              onSave={() => setIsEditorOpen(false)}
              onCancel={() => setIsEditorOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Articles</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <div className="my-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {['all', 'published', 'draft', 'archived'].map((status) => (
          <TabsContent key={status} value={status}>
            {isLoading ? (
              <div className="text-center py-8">Loading articles...</div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArticles
                      ?.filter((a) => status === 'all' || a.status === status)
                      .map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">
                            {article.title}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {article.slug}
                          </TableCell>
                          <TableCell>{getStatusBadge(article.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              {article.views_count}
                            </div>
                          </TableCell>
                          <TableCell>
                            {article.published_at
                              ? format(new Date(article.published_at), 'MMM d, yyyy')
                              : 'Not published'}
                          </TableCell>
                          <TableCell>
                            {format(new Date(article.updated_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(article.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(article.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    {filteredArticles?.filter((a) => status === 'all' || a.status === status)
                      .length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No articles found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
