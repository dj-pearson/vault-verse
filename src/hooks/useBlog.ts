import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author_id?: string;
  category_id?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  views_count: number;
  reading_time_minutes?: number;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

/**
 * Fetch all blog articles
 */
export function useBlogArticles(status?: 'draft' | 'published' | 'archived') {
  return useQuery({
    queryKey: ['blog-articles', status],
    queryFn: async () => {
      let query = supabase
        .from('blog_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BlogArticle[];
    },
  });
}

/**
 * Fetch a single blog article by slug
 */
export function useBlogArticle(slug: string) {
  return useQuery({
    queryKey: ['blog-article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as BlogArticle;
    },
    enabled: !!slug,
  });
}

/**
 * Create a new blog article
 */
export function useCreateBlogArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (article: Partial<BlogArticle>) => {
      const { data, error } = await supabase
        .from('blog_articles')
        .insert(article)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-articles'] });
    },
  });
}

/**
 * Update a blog article
 */
export function useUpdateBlogArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BlogArticle> & { id: string }) => {
      const { data, error } = await supabase
        .from('blog_articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-articles'] });
    },
  });
}

/**
 * Delete a blog article
 */
export function useDeleteBlogArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-articles'] });
    },
  });
}

/**
 * Fetch all blog categories
 */
export function useBlogCategories() {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as BlogCategory[];
    },
  });
}

/**
 * Create a blog category
 */
export function useCreateBlogCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Partial<BlogCategory>) => {
      const { data, error } = await supabase
        .from('blog_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });
}

/**
 * Fetch all blog tags
 */
export function useBlogTags() {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as BlogTag[];
    },
  });
}

/**
 * Create a blog tag
 */
export function useCreateBlogTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: Partial<BlogTag>) => {
      const { data, error } = await supabase
        .from('blog_tags')
        .insert(tag)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
    },
  });
}
