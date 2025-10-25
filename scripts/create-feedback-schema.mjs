#!/usr/bin/env node

/**
 * Feedback System Database Schema
 * 
 * Creates tables for collecting user feedback on AI answers
 * Includes thumbs up/down, detailed feedback, and quality tracking
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createFeedbackSchema() {
  console.log('🚀 Creating Feedback System Schema');
  
  try {
    // Create answer_feedback table
    const { error: feedbackError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (feedbackError) {
      console.error('❌ Error creating answer_feedback table:', feedbackError);
      return;
    }
    
    // Create feedback_categories table
    const { error: categoriesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS feedback_categories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          color TEXT DEFAULT '#3B82F6',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (categoriesError) {
      console.error('❌ Error creating feedback_categories table:', categoriesError);
      return;
    }
    
    // Create answer_analytics table
    const { error: analyticsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (analyticsError) {
      console.error('❌ Error creating answer_analytics table:', analyticsError);
      return;
    }
    
    // Create indexes for performance
    const { error: indexesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_answer_feedback_user_id ON answer_feedback(user_id);
        CREATE INDEX IF NOT EXISTS idx_answer_feedback_created_at ON answer_feedback(created_at);
        CREATE INDEX IF NOT EXISTS idx_answer_feedback_rating ON answer_feedback(rating);
        CREATE INDEX IF NOT EXISTS idx_answer_analytics_created_at ON answer_analytics(created_at);
        CREATE INDEX IF NOT EXISTS idx_answer_analytics_confidence ON answer_analytics(confidence_score);
      `
    });
    
    if (indexesError) {
      console.error('❌ Error creating indexes:', indexesError);
      return;
    }
    
    // Insert default feedback categories
    const { error: insertCategoriesError } = await supabase
      .from('feedback_categories')
      .insert([
        {
          name: 'Inaccurate Information',
          description: 'The answer contained incorrect facts or data',
          color: '#EF4444'
        },
        {
          name: 'Outdated Information',
          description: 'The information was correct but outdated',
          color: '#F59E0B'
        },
        {
          name: 'Incomplete Answer',
          description: 'The answer was correct but missing important details',
          color: '#3B82F6'
        },
        {
          name: 'Too Generic',
          description: 'The answer was too general and not personalized',
          color: '#8B5CF6'
        },
        {
          name: 'Confusing',
          description: 'The answer was hard to understand or unclear',
          color: '#6B7280'
        },
        {
          name: 'Excellent',
          description: 'The answer was comprehensive and helpful',
          color: '#10B981'
        }
      ]);
    
    if (insertCategoriesError) {
      console.error('❌ Error inserting feedback categories:', insertCategoriesError);
      return;
    }
    
    // Create RLS policies
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS
        ALTER TABLE answer_feedback ENABLE ROW LEVEL SECURITY;
        ALTER TABLE answer_analytics ENABLE ROW LEVEL SECURITY;
        
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
        ALTER TABLE feedback_categories ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Feedback categories are public" ON feedback_categories
          FOR SELECT USING (true);
      `
    });
    
    if (rlsError) {
      console.error('❌ Error creating RLS policies:', rlsError);
      return;
    }
    
    console.log('\n✅ FEEDBACK SYSTEM SCHEMA CREATED!');
    console.log('═══════════════════════════════════════════════');
    console.log('📊 Tables created:');
    console.log('  • answer_feedback - User feedback on AI answers');
    console.log('  • feedback_categories - Predefined feedback categories');
    console.log('  • answer_analytics - Analytics on answer performance');
    console.log('🔒 RLS policies enabled for data security');
    console.log('📈 Indexes created for performance');
    console.log('🎯 6 default feedback categories inserted');
    console.log('═══════════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Error creating feedback schema:', error);
    process.exit(1);
  }
}

// Run the schema creation
createFeedbackSchema();
