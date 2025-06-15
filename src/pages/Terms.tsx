import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-600">Last updated: December 2024</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  By accessing and using SnapRestore ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  These Terms of Service ("Terms") govern your use of our website and photo restoration services operated by SnapRestore.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <div className="space-y-4 text-gray-700">
                <p>SnapRestore provides AI-powered photo restoration services that allow users to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Upload damaged, old, or low-quality photographs</li>
                  <li>Process images using artificial intelligence technology</li>
                  <li>Download restored and enhanced versions of their photos</li>
                  <li>Access various tools and features for photo improvement</li>
                </ul>
                <p>The Service is provided on an "as is" and "as available" basis.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <div className="space-y-4 text-gray-700">
                <p>To access certain features of the Service, you must create an account. You agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
              <div className="space-y-4 text-gray-700">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Upload content that violates any law or regulation</li>
                  <li>Infringe on intellectual property rights of others</li>
                  <li>Upload inappropriate, offensive, or harmful content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Use the Service for commercial purposes without permission</li>
                  <li>Upload photos containing personal information of others without consent</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content and Intellectual Property</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium">Your Content</h3>
                <p>You retain ownership of photos you upload. By using our Service, you grant us:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>A limited license to process and restore your photos</li>
                  <li>The right to store your content temporarily for processing</li>
                  <li>Permission to use anonymized, aggregated data for service improvement</li>
                </ul>

                <h3 className="text-lg font-medium mt-6">Our Content</h3>
                <p>The Service and its original content, features, and functionality are owned by SnapRestore and are protected by:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>International copyright laws</li>
                  <li>Trademark and patent laws</li>
                  <li>Other intellectual property rights</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment and Subscription</h2>
              <div className="space-y-4 text-gray-700">
                <p>For paid services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All fees are non-refundable except as required by law</li>
                  <li>Subscriptions auto-renew until cancelled</li>
                  <li>Price changes will be communicated in advance</li>
                  <li>You can cancel your subscription at any time</li>
                  <li>Access to paid features ends when subscription expires</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <div className="space-y-4 text-gray-700">
                <p>Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>
                <p>Key privacy commitments:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Photos are processed securely and deleted after restoration</li>
                  <li>Personal information is protected with industry-standard security</li>
                  <li>We do not share your photos with third parties</li>
                  <li>You can delete your account and data at any time</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimers and Limitations</h2>
              <div className="space-y-4 text-gray-700">
                <p>The Service is provided "as is" without warranties of any kind. We disclaim all warranties, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Merchantability and fitness for a particular purpose</li>
                  <li>Accuracy or completeness of restoration results</li>
                  <li>Uninterrupted or error-free service</li>
                  <li>Security of data transmission</li>
                </ul>
                <p className="mt-4">
                  Our liability is limited to the maximum extent permitted by law. We are not liable for indirect, 
                  incidental, or consequential damages arising from your use of the Service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              <div className="space-y-4 text-gray-700">
                <p>We may terminate or suspend your account and access to the Service:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Immediately, without prior notice, for violation of these Terms</li>
                  <li>For prolonged inactivity</li>
                  <li>At our sole discretion for any reason</li>
                </ul>
                <p>Upon termination, your right to use the Service ceases immediately.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of significant changes 
                  via email or through the Service. Continued use after changes constitutes acceptance of the new Terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>For questions about these Terms, please contact us:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Email: legal@snaprestore.com</li>
                  <li>Address: 123 Tech Street, San Francisco, CA 94105</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
