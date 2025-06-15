import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, Zap, Crown, CreditCard } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

interface PricingSectionProps {
  onSignUpClick: () => void;
}

const PricingSection = ({ onSignUpClick }: PricingSectionProps) => {
  const [isPayAsYouGo, setIsPayAsYouGo] = useState(false);

  const firstCard = isPayAsYouGo ? {
    name: "Pay As You Go",
    credits: 1,
    price: "$3",
    description: "Perfect for trying our restoration magic",
    features: [
      "1 photo restoration",
      "High-quality output",
      "Fast processing",
      "Download in multiple formats",
      "No commitment required"
    ],
    icon: CreditCard,
    popular: false
  } : {
    name: "Starter Pack",
    credits: 10,
    price: "$25",
    description: "Great value for occasional restoration",
    features: [
      "10 photo restorations",
      "High-quality output",
      "Fast processing",
      "Download in multiple formats",
      "Credits roll over to next purchase"
    ],
    icon: Sparkles,
    popular: false
  };

  const plans = [
    firstCard,
    {
      name: "Family Pack",
      credits: 50,
      price: "$75",
      description: "Best value for regular users",
      features: [
        "50 photo restorations",
        "High-quality output",
        "Priority processing",
        "Download in multiple formats",
        "Email support",
        "Credits roll over to next purchase"
      ],
      icon: Zap,
      popular: true
    },
    {
      name: "Heritage Pack",
      credits: 150,
      price: "$180",
      description: "For serious photo restoration projects",
      features: [
        "150 photo restorations",
        "Highest quality output",
        "Lightning-fast processing",
        "Download in multiple formats",
        "Priority customer support",
        "Credits roll over to next purchase",
        { text: "Batch uploads", comingSoon: true }
      ],
      icon: Crown,
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-violet-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple Credit-Based Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pay only for what you use. No subscriptions, no monthly fees. 
            Buy credits and restore photos whenever you need to.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-2 border-purple-500 shadow-xl scale-105' : 'border border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-violet-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  {index === 0 && (
                    <motion.div 
                      className="flex items-center justify-center space-x-2 mb-4"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label 
                        htmlFor="pricing-toggle" 
                        className={`text-sm transition-colors duration-200 ${
                          !isPayAsYouGo ? 'text-purple-600 font-medium' : 'text-gray-500'
                        }`}
                      >
                        Starter Pack
                      </Label>
                      <div className="relative">
                        <Switch
                          id="pricing-toggle"
                          checked={isPayAsYouGo}
                          onCheckedChange={setIsPayAsYouGo}
                          className="data-[state=checked]:bg-purple-500 transition-colors duration-200"
                        />
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          initial={false}
                          animate={{
                            scale: isPayAsYouGo ? [1, 1.2, 1] : [1, 1.2, 1]
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <Label 
                        htmlFor="pricing-toggle" 
                        className={`text-sm transition-colors duration-200 ${
                          isPayAsYouGo ? 'text-purple-600 font-medium' : 'text-gray-500'
                        }`}
                      >
                        Pay As You Go
                      </Label>
                    </motion.div>
                  )}
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={plan.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                        plan.popular ? 'bg-gradient-to-br from-purple-500 to-violet-500' : 'bg-gradient-to-br from-purple-400 to-violet-400'
                      }`}>
                        <Icon size={28} className="text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {plan.name}
                      </CardTitle>
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600">/ {plan.credits} {plan.credits === 1 ? 'credit' : 'credits'}</span>
                      </div>
                      <CardDescription className="text-gray-600">
                        {plan.description}
                      </CardDescription>
                    </motion.div>
                  </AnimatePresence>
                </CardHeader>

                <CardContent className="pt-0">
                  <AnimatePresence mode="wait">
                    <motion.ul 
                      key={plan.name}
                      className="space-y-3 mb-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={featureIndex}
                          className="flex items-center space-x-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.1 }}
                        >
                          <Check size={18} className="text-purple-500 flex-shrink-0" />
                          {typeof feature === 'string' ? (
                            <span className="text-gray-700">{feature}</span>
                          ) : (
                            <span className="text-gray-700">
                              {feature.text}
                              {feature.comingSoon && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                  coming soon
                                </span>
                              )}
                            </span>
                          )}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </AnimatePresence>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={onSignUpClick}
                      className={`w-full py-3 font-semibold text-lg transition-all duration-300 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-lg hover:shadow-xl' 
                          : 'bg-white border-2 border-purple-500 text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      Get {plan.credits} {plan.credits === 1 ? 'Credit' : 'Credits'}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            ✨ Credits never expire • Roll over to next purchase • No hidden fees
          </p>
          <div className="inline-flex items-center px-6 py-3 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            💡 Need more credits? Contact us for custom packages
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection; 