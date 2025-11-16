-- Create subscription plans enum
CREATE TYPE public.subscription_plan AS ENUM ('free', 'team', 'enterprise');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create usage metrics table
CREATE TABLE public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  projects_count INTEGER DEFAULT 0,
  secrets_count INTEGER DEFAULT 0,
  team_members_count INTEGER DEFAULT 0,
  api_calls_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create billing history table
CREATE TABLE public.billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  invoice_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  stripe_invoice_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for usage_metrics
CREATE POLICY "Users can view their own usage metrics"
  ON public.usage_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage metrics"
  ON public.usage_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for billing_history
CREATE POLICY "Users can view their own billing history"
  ON public.billing_history FOR SELECT
  USING (auth.uid() = user_id);

-- Function to get plan limits
CREATE OR REPLACE FUNCTION public.get_plan_limits(plan_type subscription_plan)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN CASE plan_type
    WHEN 'free' THEN json_build_object(
      'projects', 3,
      'secrets_per_project', 10,
      'team_members', 1,
      'environments', 3
    )
    WHEN 'team' THEN json_build_object(
      'projects', 10,
      'secrets_per_project', 100,
      'team_members', 10,
      'environments', 3
    )
    WHEN 'enterprise' THEN json_build_object(
      'projects', -1,
      'secrets_per_project', -1,
      'team_members', -1,
      'environments', -1
    )
  END;
END;
$$;

-- Function to check if user exceeded plan limits
CREATE OR REPLACE FUNCTION public.check_plan_limits(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_plan subscription_plan;
  plan_limits JSON;
  current_usage JSON;
  projects_count INTEGER;
  team_members_total INTEGER;
BEGIN
  -- Get current plan
  SELECT plan INTO current_plan
  FROM subscriptions
  WHERE user_id = user_uuid;
  
  IF current_plan IS NULL THEN
    current_plan := 'free';
  END IF;
  
  -- Get plan limits
  plan_limits := get_plan_limits(current_plan);
  
  -- Calculate current usage
  SELECT COUNT(*) INTO projects_count
  FROM projects
  WHERE owner_id = user_uuid;
  
  SELECT COUNT(*) INTO team_members_total
  FROM team_members tm
  JOIN projects p ON tm.project_id = p.id
  WHERE p.owner_id = user_uuid;
  
  current_usage := json_build_object(
    'projects', projects_count,
    'team_members', team_members_total,
    'exceeds_limits', (
      (plan_limits->>'projects')::int != -1 AND projects_count > (plan_limits->>'projects')::int
    ) OR (
      (plan_limits->>'team_members')::int != -1 AND team_members_total > (plan_limits->>'team_members')::int
    )
  );
  
  RETURN json_build_object(
    'plan', current_plan,
    'limits', plan_limits,
    'usage', current_usage
  );
END;
$$;

-- Function to update usage metrics
CREATE OR REPLACE FUNCTION public.update_usage_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_uuid UUID;
  current_period_start TIMESTAMP WITH TIME ZONE;
  current_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the owner_id based on the table
  IF TG_TABLE_NAME = 'projects' THEN
    owner_uuid := COALESCE(NEW.owner_id, OLD.owner_id);
  ELSIF TG_TABLE_NAME = 'secrets' THEN
    SELECT p.owner_id INTO owner_uuid
    FROM environments e
    JOIN projects p ON e.project_id = p.id
    WHERE e.id = COALESCE(NEW.environment_id, OLD.environment_id);
  ELSIF TG_TABLE_NAME = 'team_members' THEN
    SELECT p.owner_id INTO owner_uuid
    FROM projects p
    WHERE p.id = COALESCE(NEW.project_id, OLD.project_id);
  END IF;
  
  -- Get current period
  SELECT 
    date_trunc('month', now()),
    date_trunc('month', now()) + interval '1 month'
  INTO current_period_start, current_period_end;
  
  -- Update or insert usage metrics
  INSERT INTO usage_metrics (user_id, period_start, period_end, projects_count, secrets_count, team_members_count)
  VALUES (
    owner_uuid,
    current_period_start,
    current_period_end,
    (SELECT COUNT(*) FROM projects WHERE owner_id = owner_uuid),
    (SELECT COUNT(*) FROM secrets s 
     JOIN environments e ON s.environment_id = e.id 
     JOIN projects p ON e.project_id = p.id 
     WHERE p.owner_id = owner_uuid),
    (SELECT COUNT(*) FROM team_members tm 
     JOIN projects p ON tm.project_id = p.id 
     WHERE p.owner_id = owner_uuid)
  )
  ON CONFLICT (user_id, period_start) 
  DO UPDATE SET
    projects_count = EXCLUDED.projects_count,
    secrets_count = EXCLUDED.secrets_count,
    team_members_count = EXCLUDED.team_members_count,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Add unique constraint for usage metrics period
ALTER TABLE usage_metrics ADD CONSTRAINT unique_user_period UNIQUE (user_id, period_start);

-- Triggers to track usage
CREATE TRIGGER track_project_usage
  AFTER INSERT OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_usage_metrics();

CREATE TRIGGER track_secret_usage
  AFTER INSERT OR DELETE ON secrets
  FOR EACH ROW EXECUTE FUNCTION update_usage_metrics();

CREATE TRIGGER track_team_member_usage
  AFTER INSERT OR DELETE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_usage_metrics();

-- Function to create default subscription on user signup
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$;

-- Trigger to create subscription on profile creation
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- Function to update subscription updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_usage_metrics_updated_at
  BEFORE UPDATE ON usage_metrics
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();