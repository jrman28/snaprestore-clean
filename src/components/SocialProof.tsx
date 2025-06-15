
import React from 'react';
import { Star } from 'lucide-react';

const SocialProof = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Family Historian",
      content: "SnapRestore brought my grandmother's wedding photos back to life. The results were absolutely magical—I cried happy tears!",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Photography Enthusiast",
      content: "I've tried many restoration tools, but nothing comes close to SnapRestore. The transformation is incredible and the results are professional-grade.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Genealogy Researcher",
      content: "Perfect for preserving family history. The interface is so simple that even my 80-year-old father can use it without any help.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="container mx-auto px-6">
        {/* Testimonials Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h3>
          <p className="text-gray-600">
            Real stories from real people who've transformed their photos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-soft-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="text-amber-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="border-t pt-4">
                <div className="font-semibold text-gray-900">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-500">
                  {testimonial.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
