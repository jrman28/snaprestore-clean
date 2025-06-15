
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload } from 'lucide-react';

interface CTASectionProps {
  onSignUpClick: () => void;
}

const CTASection = ({ onSignUpClick }: CTASectionProps) => {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.3) 1px, transparent 0),
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0)
          `,
          backgroundSize: '24px 24px, 48px 48px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Restore Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
              Precious Memories?
            </span>
          </h2>
          
          <p className="text-xl text-purple-100 mb-8 leading-relaxed max-w-2xl mx-auto">
            Join thousands of families who've already brought their photos back to life. 
            Start with 1 free restoration—no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={onSignUpClick}
              size="lg"
              className="bg-white text-purple-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 touch-target rounded-xl"
            >
              <Upload size={20} className="mr-3" />
              Start Restoring Free
              <ArrowRight size={20} className="ml-3" />
            </Button>
            
            <div className="text-purple-200 text-sm">
              ✨ 1 free restoration • Then buy credits as needed
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-purple-400/30">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="text-purple-100">
                <div className="text-2xl font-bold text-white mb-1">Pay per use</div>
                <div className="text-sm">Credits never expire</div>
              </div>
              <div className="text-purple-100">
                <div className="text-2xl font-bold text-white mb-1">Zero risk</div>
                <div className="text-sm">Your photos stay private</div>
              </div>
              <div className="text-purple-100">
                <div className="text-2xl font-bold text-white mb-1">100% satisfaction</div>
                <div className="text-sm">Love it or your money back</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
