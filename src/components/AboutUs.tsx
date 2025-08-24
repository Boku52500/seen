import React from 'react';
import { Heart, Users, Award, Truck } from 'lucide-react';
import LogoAbout from '/assets/logoabout.jpg';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About Us
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Empowering women to own their confidence, embrace their femininity, and always be – SEEN
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              At Seen Studios, we believe that true luxury is timeless. We don’t just design clothing — we pour our passion into every step of the process. We love what we do, and it shows in every stitch, fabric choice, and silhouette. We care deeply about our community — the people who inspire us, support us, and wear our pieces with pride. Our hope is that everyone who wears Seen feels confident, empowered, and truly Seen. Because to us, fashion lives in the details — in lasting pieces that hold meaning, evoke emotion, and become part of your story. We see each garment as a quality memory, made to stay with you — not just for a season, but forever.
              </p>
              
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center">
                <img src={LogoAbout} alt="Seen Studios" className="aspect-square rounded-2xl flex items-center justify-center" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              What We Stand For
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our values guide everything we do, from design to customer service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality First</h3>
              <p className="text-gray-600 leading-relaxed">
                We use only the finest materials and work with skilled artisans to ensure 
                every piece meets our high standards of quality and craftsmanship.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Focused</h3>
              <p className="text-gray-600 leading-relaxed">
                Your satisfaction is our priority. We're committed to providing exceptional 
                service and creating pieces that make you feel amazing.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Fast & Reliable</h3>
              <p className="text-gray-600 leading-relaxed">
                We ensure quick processing and reliable shipping so you can enjoy your 
                new favorites as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>

      
  );
};

export default AboutUs;
