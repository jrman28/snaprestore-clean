
import React from 'react';
import { Upload, Zap, Shield } from 'lucide-react';

const FeatureList = () => {
  const features = [
    {
      icon: Upload,
      title: "Upload in seconds—no tech skills needed",
      bulletColor: "bg-purple-600"
    },
    {
      icon: Zap,
      title: "See your memories revived instantly",
      bulletColor: "bg-purple-600"
    },
    {
      icon: Shield,
      title: "Your photos are private, safe, and never shared",
      bulletColor: "bg-purple-600"
    }
  ];

  return (
    <div className="space-y-4">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${feature.bulletColor} flex-shrink-0`}></div>
          <span className="text-gray-700 text-sm sm:text-base">{feature.title}</span>
        </div>
      ))}
    </div>
  );
};

export default FeatureList;
