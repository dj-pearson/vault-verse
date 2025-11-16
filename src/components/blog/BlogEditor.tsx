import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useBlogArticle,
  useCreateBlogArticle,
  useUpdateBlogArticle,
  useBlogCategories,
} from '@/hooks/useBlog';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

interface BlogEditorProps {
  articleId?: string;
  onSave: () => void;
  onCancel: () => void;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({ articleId, onSave, onCancel }) => {
  const { data: article } = useBlogArticle(articleId || '');
  const { data: categories } = useBlogCategories();
  const createArticle = useCreateBlogArticle();
  const updateArticle = useUpdateBlogArticle();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Write your article content here...',
      }),
    ],
    content: article?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setSlug(article.slug);
      setExcerpt(article.excerpt || '');
      setFeaturedImage(article.featured_image || '');
      setCategoryId(article.category_id || '');
      setStatus(article.status);
      editor?.commands.setContent(article.content);
    }
  }, [article, editor]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!articleId && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [title, articleId]);

  const handleSave = async () => {
    const content = editor?.getHTML() || '';

    const articleData = {
      title,
      slug,
      excerpt,
      content,
      featured_image: featuredImage,
      category_id: categoryId || null,
      status,
      published_at: status === 'published' && !article?.published_at
        ? new Date().toISOString()
        : article?.published_at,
    };

    try {
      if (articleId) {
        await updateArticle.mutateAsync({ id: articleId, ...articleData });
      } else {
        await createArticle.mutateAsync(articleData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save article');
    }
  };

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
          />
        </div>

        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="article-slug"
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief description of the article"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="featured-image">Featured Image URL</Label>
          <Input
            id="featured-image"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Editor Toolbar */}
      <div className="border-b pb-2">
        <Label>Content</Label>
        <div className="flex gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={editor?.isActive('bold') ? 'bg-accent' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={editor?.isActive('italic') ? 'bg-accent' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={editor?.isActive('bulletList') ? 'bg-accent' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={editor?.isActive('orderedList') ? 'bg-accent' : ''}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLink}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImage}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="border rounded-lg">
        <EditorContent editor={editor} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!title || !slug}>
          {articleId ? 'Update' : 'Create'} Article
        </Button>
      </div>
    </div>
  );
};
