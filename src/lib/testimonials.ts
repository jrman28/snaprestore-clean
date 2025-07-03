import { supabase } from '@/integrations/supabase/client';

export interface Testimonial {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

/**
 * Fetch approved testimonials for display on landing page
 */
export async function getTestimonials(limit: number = 10): Promise<Testimonial[]> {
  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .select(`
        id,
        rating,
        comment,
        created_at,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('can_use_as_testimonial', true)
      .gte('rating', 4)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map(item => ({
      id: item.id,
      rating: item.rating,
      comment: item.comment,
      created_at: item.created_at,
      user_name: item.profiles?.full_name || 'Anonymous User',
      user_avatar: item.profiles?.avatar_url
    })) || [];

  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

/**
 * Get testimonial statistics for analytics
 */
export async function getTestimonialStats() {
  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('rating, can_use_as_testimonial')
      .not('comment', 'is', null);

    if (error) throw error;

    const stats = {
      total_feedback: data?.length || 0,
      total_testimonials: data?.filter(item => item.can_use_as_testimonial).length || 0,
      average_rating: data?.length 
        ? (data.reduce((sum, item) => sum + item.rating, 0) / data.length).toFixed(1)
        : '0',
      five_star_count: data?.filter(item => item.rating === 5).length || 0,
      four_star_count: data?.filter(item => item.rating === 4).length || 0
    };

    return stats;

  } catch (error) {
    console.error('Error fetching testimonial stats:', error);
    return {
      total_feedback: 0,
      total_testimonials: 0,
      average_rating: '0',
      five_star_count: 0,
      four_star_count: 0
    };
  }
} 