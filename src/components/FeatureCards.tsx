
import React from 'react';
import { Upload, Sparkles, Download } from 'lucide-react';

const FeatureCards = () => {
  const steps = [
    {
      step: "01",
      icon: Upload,
      title: "Upload & Click Restore",
      description: "Drop your old photo and hit the restore button. That's it—no complicated settings or technical know-how required."
    },
    {
      step: "02", 
      icon: Sparkles,
      title: "Watch the Magic Happen",
      description: "Sit back and relax while our restoration magic works behind the scenes. Your photo is being transformed in real-time."
    },
    {
      step: "03",
      icon: Download,
      title: "Download Your Masterpiece",
      description: "In just seconds, your beautifully restored photo is ready. Download it instantly and share your renewed memories."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Photo Restoration in 3 Simple Steps
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your cherished memories in seconds. No expertise needed—just pure magic that brings your photos back to life.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon size={32} className="text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-purple-50 text-purple-700 rounded-full text-lg font-medium">
            ✨ Average restoration time: Under 30 seconds
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
