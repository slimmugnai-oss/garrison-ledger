-- Feedback System Database Schema
-- Creates tables for collecting user feedback on AI answers

-- Create answer_feedback table
CREATE TABLE IF NOT EXISTS answer_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id UUID,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  thumbs_up BOOLEAN,
  thumbs_down BOOLEAN,
  feedback_text TEXT,
  feedback_categories TEXT[],
  answer_mode TEXT CHECK (answer_mode IN ('strict', 'advisory')),
  confidence_score DECIMAL(3,2),
  response_time_ms INTEGER,
  sources_used TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback_categories table
CREATE TABLE IF NOT EXISTS feedback_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create answer_analytics table
CREATE TABLE IF NOT EXISTS answer_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  answer_mode TEXT CHECK (answer_mode IN ('strict', 'advisory')),
  confidence_score DECIMAL(3,2),
  response_time_ms INTEGER,
  sources_used TEXT[],
  rag_chunks_used INTEGER DEFAULT 0,
  user_tier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_answer_feedback_user_id ON answer_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_feedback_created_at ON answer_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_answer_feedback_rating ON answer_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_answer_analytics_created_at ON answer_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_answer_analytics_confidence ON answer_analytics(confidence_score);

-- Insert default feedback categories
INSERT INTO feedback_categories (name, description, color) VALUES
  ('Inaccurate Information', 'The answer contained incorrect facts or data', '#EF4444'),
  ('Outdated Information', 'The information was correct but outdated', '#F59E0B'),
  ('Incomplete Answer', 'The answer was correct but missing important details', '#3B82F6'),
  ('Too Generic', 'The answer was too general and not personalized', '#8B5CF6'),
  ('Confusing', 'The answer was hard to understand or unclear', '#6B7280'),
  ('Excellent', 'The answer was comprehensive and helpful', '#10B981')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE answer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own feedback
CREATE POLICY "Users can view own feedback" ON answer_feedback
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback" ON answer_feedback
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own feedback
CREATE POLICY "Users can update own feedback" ON answer_feedback
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Analytics table is read-only for users
CREATE POLICY "Users can view analytics" ON answer_analytics
  FOR SELECT USING (true);

-- Feedback categories are public
CREATE POLICY "Feedback categories are public" ON feedback_categories
  FOR SELECT USING (true);
