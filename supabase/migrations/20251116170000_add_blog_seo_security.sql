-- Migration: Add Blog, SEO Management, and Security Monitoring Features
-- Created: 2025-11-16

-- ============================================================================
-- BLOG SYSTEM TABLES
-- ============================================================================

-- Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Tags Table
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Articles Table
CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Article Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS blog_article_tags (
  article_id UUID REFERENCES blog_articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Blog Article SEO Metadata
CREATE TABLE IF NOT EXISTS blog_article_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES blog_articles(id) ON DELETE CASCADE UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  twitter_card_type TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  canonical_url TEXT,
  schema_markup JSONB,
  focus_keyword TEXT,
  keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SEO MANAGEMENT TABLES
-- ============================================================================

-- Global SEO Settings
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT DEFAULT 'VaultVerse',
  site_description TEXT,
  default_og_image TEXT,
  favicon_url TEXT,
  google_analytics_id TEXT,
  google_search_console_id TEXT,
  bing_webmaster_id TEXT,
  robots_txt TEXT,
  default_meta_tags JSONB,
  structured_data_organization JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default SEO settings
INSERT INTO seo_settings (site_description, robots_txt, default_meta_tags)
VALUES (
  'VaultVerse - Secure environment variable management for teams',
  E'User-agent: *\nAllow: /\nDisallow: /dashboard/\nDisallow: /admin/\nSitemap: https://vaultverse.com/sitemap.xml',
  '{"author": "VaultVerse Team", "viewport": "width=device-width, initial-scale=1.0"}'::jsonb
) ON CONFLICT DO NOTHING;

-- Page-specific SEO Metadata
CREATE TABLE IF NOT EXISTS seo_page_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  twitter_card_type TEXT DEFAULT 'summary_large_image',
  canonical_url TEXT,
  no_index BOOLEAN DEFAULT FALSE,
  no_follow BOOLEAN DEFAULT FALSE,
  schema_markup JSONB,
  custom_meta_tags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default page SEO metadata
INSERT INTO seo_page_metadata (page_path, page_title, meta_description) VALUES
  ('/', 'Home - Secure Environment Variable Management', 'VaultVerse provides secure, local-first environment variable management for teams with zero-knowledge encryption.'),
  ('/features', 'Features - Advanced Security & Team Collaboration', 'Discover VaultVerse features: zero-knowledge encryption, team collaboration, CLI integration, and more.'),
  ('/pricing', 'Pricing - Flexible Plans for Every Team', 'Choose the perfect VaultVerse plan for your team. Free for solo developers, $8/user for teams.'),
  ('/docs', 'Documentation - Get Started with VaultVerse', 'Complete documentation and guides for VaultVerse environment variable management.')
ON CONFLICT (page_path) DO NOTHING;

-- Sitemap Entries
CREATE TABLE IF NOT EXISTS sitemap_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  priority DECIMAL(2,1) DEFAULT 0.5 CHECK (priority >= 0 AND priority <= 1),
  change_frequency TEXT DEFAULT 'weekly' CHECK (change_frequency IN ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')),
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  auto_generated BOOLEAN DEFAULT FALSE,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default sitemap entries
INSERT INTO sitemap_entries (url, priority, change_frequency) VALUES
  ('/', 1.0, 'weekly'),
  ('/features', 0.8, 'monthly'),
  ('/pricing', 0.8, 'monthly'),
  ('/docs', 0.9, 'weekly')
ON CONFLICT (url) DO NOTHING;

-- ============================================================================
-- SECURITY MONITORING TABLES
-- ============================================================================

-- Database Leak Detection Logs
CREATE TABLE IF NOT EXISTS security_leak_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_type TEXT NOT NULL CHECK (detection_type IN ('database_leak', 'env_leak', 'api_key_leak', 'credential_leak')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  source TEXT NOT NULL,
  description TEXT NOT NULL,
  leaked_data_sample TEXT,
  affected_tables TEXT[],
  affected_users UUID[],
  detection_method TEXT,
  auto_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Environment Variable Exposure Tracking
CREATE TABLE IF NOT EXISTS env_exposure_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_type TEXT NOT NULL CHECK (scan_type IN ('automated', 'manual', 'scheduled')),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  findings_count INTEGER DEFAULT 0,
  critical_findings_count INTEGER DEFAULT 0,
  high_findings_count INTEGER DEFAULT 0,
  medium_findings_count INTEGER DEFAULT 0,
  low_findings_count INTEGER DEFAULT 0,
  scan_results JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  triggered_by UUID REFERENCES auth.users(id)
);

-- Environment Variable Findings
CREATE TABLE IF NOT EXISTS env_exposure_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES env_exposure_scans(id) ON DELETE CASCADE,
  finding_type TEXT NOT NULL CHECK (finding_type IN ('exposed_in_code', 'exposed_in_logs', 'weak_encryption', 'public_repository', 'insecure_transmission')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  environment_id UUID REFERENCES environments(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  variable_name TEXT NOT NULL,
  location TEXT,
  description TEXT NOT NULL,
  recommendation TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'false_positive')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Scan Schedules
CREATE TABLE IF NOT EXISTS security_scan_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_type TEXT NOT NULL CHECK (scan_type IN ('env_exposure', 'database_leak', 'full_security')),
  schedule_cron TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  notification_emails TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Blog Indexes
CREATE INDEX idx_blog_articles_status ON blog_articles(status);
CREATE INDEX idx_blog_articles_published_at ON blog_articles(published_at DESC);
CREATE INDEX idx_blog_articles_author ON blog_articles(author_id);
CREATE INDEX idx_blog_articles_category ON blog_articles(category_id);
CREATE INDEX idx_blog_articles_slug ON blog_articles(slug);
CREATE INDEX idx_blog_article_tags_article ON blog_article_tags(article_id);
CREATE INDEX idx_blog_article_tags_tag ON blog_article_tags(tag_id);

-- SEO Indexes
CREATE INDEX idx_seo_page_metadata_path ON seo_page_metadata(page_path);
CREATE INDEX idx_sitemap_entries_enabled ON sitemap_entries(enabled);
CREATE INDEX idx_sitemap_entries_last_modified ON sitemap_entries(last_modified DESC);

-- Security Indexes
CREATE INDEX idx_security_leaks_type ON security_leak_detections(detection_type);
CREATE INDEX idx_security_leaks_severity ON security_leak_detections(severity);
CREATE INDEX idx_security_leaks_created ON security_leak_detections(created_at DESC);
CREATE INDEX idx_env_scans_status ON env_exposure_scans(status);
CREATE INDEX idx_env_scans_started ON env_exposure_scans(started_at DESC);
CREATE INDEX idx_env_findings_scan ON env_exposure_findings(scan_id);
CREATE INDEX idx_env_findings_severity ON env_exposure_findings(severity);
CREATE INDEX idx_env_findings_status ON env_exposure_findings(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_article_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_page_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitemap_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_leak_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE env_exposure_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE env_exposure_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_scan_schedules ENABLE ROW LEVEL SECURITY;

-- Blog: Public can read published articles
CREATE POLICY "Public can read published articles"
  ON blog_articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read categories"
  ON blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Public can read tags"
  ON blog_tags FOR SELECT
  USING (true);

CREATE POLICY "Public can read article tags"
  ON blog_article_tags FOR SELECT
  USING (true);

CREATE POLICY "Public can read published article SEO"
  ON blog_article_seo FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM blog_articles
      WHERE blog_articles.id = blog_article_seo.article_id
      AND blog_articles.status = 'published'
    )
  );

-- Blog: Admins can manage all
CREATE POLICY "Admins can manage articles"
  ON blog_articles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage categories"
  ON blog_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage tags"
  ON blog_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage article tags"
  ON blog_article_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage article SEO"
  ON blog_article_seo FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- SEO: Public can read
CREATE POLICY "Public can read SEO settings"
  ON seo_settings FOR SELECT
  USING (true);

CREATE POLICY "Public can read page metadata"
  ON seo_page_metadata FOR SELECT
  USING (NOT no_index);

CREATE POLICY "Public can read enabled sitemap entries"
  ON sitemap_entries FOR SELECT
  USING (enabled = true);

-- SEO: Admins can manage
CREATE POLICY "Admins can manage SEO settings"
  ON seo_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage page metadata"
  ON seo_page_metadata FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage sitemap"
  ON sitemap_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Security: Admins only
CREATE POLICY "Admins can manage security leaks"
  ON security_leak_detections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage env scans"
  ON env_exposure_scans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage env findings"
  ON env_exposure_findings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage scan schedules"
  ON security_scan_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to auto-generate sitemap entries when blog articles are published
CREATE OR REPLACE FUNCTION auto_generate_sitemap_for_article()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    INSERT INTO sitemap_entries (url, priority, change_frequency, auto_generated)
    VALUES (
      '/blog/' || NEW.slug,
      0.7,
      'monthly',
      true
    )
    ON CONFLICT (url) DO UPDATE
    SET last_modified = NOW();
  END IF;

  IF NEW.status != 'published' AND OLD.status = 'published' THEN
    UPDATE sitemap_entries
    SET enabled = false
    WHERE url = '/blog/' || NEW.slug AND auto_generated = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto sitemap generation
DROP TRIGGER IF EXISTS trigger_auto_generate_sitemap ON blog_articles;
CREATE TRIGGER trigger_auto_generate_sitemap
  AFTER INSERT OR UPDATE ON blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_sitemap_for_article();

-- Function to update article reading time
CREATE OR REPLACE FUNCTION calculate_reading_time()
RETURNS TRIGGER AS $$
BEGIN
  -- Assuming average reading speed of 200 words per minute
  NEW.reading_time_minutes := GREATEST(1, ROUND(
    array_length(regexp_split_to_array(NEW.content, '\s+'), 1) / 200.0
  ));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reading time calculation
DROP TRIGGER IF EXISTS trigger_calculate_reading_time ON blog_articles;
CREATE TRIGGER trigger_calculate_reading_time
  BEFORE INSERT OR UPDATE ON blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_reading_time();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_blog_categories_updated_at ON blog_categories;
CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_articles_updated_at ON blog_articles;
CREATE TRIGGER update_blog_articles_updated_at
  BEFORE UPDATE ON blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_article_seo_updated_at ON blog_article_seo;
CREATE TRIGGER update_blog_article_seo_updated_at
  BEFORE UPDATE ON blog_article_seo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seo_settings_updated_at ON seo_settings;
CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seo_page_metadata_updated_at ON seo_page_metadata;
CREATE TRIGGER update_seo_page_metadata_updated_at
  BEFORE UPDATE ON seo_page_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_security_scan_schedules_updated_at ON security_scan_schedules;
CREATE TRIGGER update_security_scan_schedules_updated_at
  BEFORE UPDATE ON security_scan_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment article views
CREATE OR REPLACE FUNCTION increment_article_views(article_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE blog_articles
  SET views_count = views_count + 1
  WHERE slug = article_slug AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON blog_articles, blog_categories, blog_tags, blog_article_tags, blog_article_seo TO anon, authenticated;
GRANT SELECT ON seo_settings, seo_page_metadata, sitemap_entries TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
