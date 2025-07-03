import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';
import { getTestimonials, getTestimonialStats, type Testimonial } from '@/lib/testimonials';

interface TestimonialSectionProps {
  maxTestimonials?: number;
  showStats?: boolean;
}

export function TestimonialSection({ maxTestimonials = 6, showStats = true }: TestimonialSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState({
    total_feedback: 0,
    total_testimonials: 0,
    average_rating: '0',
    five_star_count: 0,
    four_star_count: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testimonialsData, statsData] = await Promise.all([
          getTestimonials(maxTestimonials),
          showStats ? getTestimonialStats() : Promise.resolve(stats)
        ]);
        
        setTestimonials(testimonialsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching testimonial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [maxTestimonials, showStats]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show section if no testimonials
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Loved by thousands of users
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what our customers are saying about their photo restoration experience
          </p>
          
          {showStats && (
            <div className="flex justify-center items-center space-x-8 mt-8">
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  {renderStars(5)}
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.average_rating}</p>
                <p className="text-sm text-gray-600">Average rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.total_testimonials}</p>
                <p className="text-sm text-gray-600">Happy customers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.five_star_count}</p>
                <p className="text-sm text-gray-600">5-star reviews</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-1 mb-3">
                  {renderStars(testimonial.rating)}
                </div>
                
                <div className="relative mb-4">
                  <Quote className="absolute -top-1 -left-1 w-6 h-6 text-purple-200" />
                  <p className="text-gray-700 pl-4 italic leading-relaxed">
                    "{testimonial.comment}"
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={testimonial.user_avatar} />
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {testimonial.user_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">
                      {testimonial.user_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(testimonial.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {testimonials.length >= maxTestimonials && (
          <div className="text-center mt-8">
            <p className="text-gray-600">
              And many more happy customers! 
              <span className="text-purple-600 font-medium"> Join them today.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 