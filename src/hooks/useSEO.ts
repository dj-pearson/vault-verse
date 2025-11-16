import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SEOSettings {
  id: string;
  site_name: string;
  site_description?: string;
  default_og_image?: string;
  favicon_url?: string;
  google_analytics_id?: string;
  google_search_console_id?: string;
  bing_webmaster_id?: string;
  robots_txt?: string;
  default_meta_tags?: Record<string, any>;
  structured_data_organization?: Record<string, any>;
}

export interface PageMetadata {
  id: string;
  page_path: string;
  page_title: string;
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_card_type?: string;
  canonical_url?: string;
  no_index: boolean;
  no_follow: boolean;
  schema_markup?: Record<string, any>;
  custom_meta_tags?: Record<string, any>;
}

export interface SitemapEntry {
  id: string;
  url: string;
  priority: number;
  change_frequency: string;
  last_modified: string;
  auto_generated: boolean;
  enabled: boolean;
}

/**
 * Fetch global SEO settings
 */
export function useSEOSettings() {
  return useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data as SEOSettings;
    },
  });
}

/**
 * Update SEO settings
 */
export function useUpdateSEOSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<SEOSettings>) => {
      const { data, error } = await supabase
        .from('seo_settings')
        .update(settings)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
    },
  });
}

/**
 * Fetch all page metadata
 */
export function usePageMetadata() {
  return useQuery({
    queryKey: ['page-metadata'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_page_metadata')
        .select('*')
        .order('page_path');

      if (error) throw error;
      return data as PageMetadata[];
    },
  });
}

/**
 * Fetch metadata for a specific page
 */
export function usePageMetadataByPath(path: string) {
  return useQuery({
    queryKey: ['page-metadata', path],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_page_metadata')
        .select('*')
        .eq('page_path', path)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as PageMetadata | null;
    },
    enabled: !!path,
  });
}

/**
 * Create or update page metadata
 */
export function useUpsertPageMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metadata: Partial<PageMetadata>) => {
      const { data, error } = await supabase
        .from('seo_page_metadata')
        .upsert(metadata)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-metadata'] });
    },
  });
}

/**
 * Delete page metadata
 */
export function useDeletePageMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('seo_page_metadata')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-metadata'] });
    },
  });
}

/**
 * Fetch all sitemap entries
 */
export function useSitemapEntries() {
  return useQuery({
    queryKey: ['sitemap-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sitemap_entries')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as SitemapEntry[];
    },
  });
}

/**
 * Create or update sitemap entry
 */
export function useUpsertSitemapEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Partial<SitemapEntry>) => {
      const { data, error } = await supabase
        .from('sitemap_entries')
        .upsert({
          ...entry,
          last_modified: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sitemap-entries'] });
    },
  });
}

/**
 * Delete sitemap entry
 */
export function useDeleteSitemapEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sitemap_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sitemap-entries'] });
    },
  });
}
