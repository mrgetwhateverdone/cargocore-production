import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Check, BarChart3, Zap, Shield, TrendingUp, Users, DollarSign, Loader2 } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';

/**
 * This part of the code creates the main landing page with HubSpot-inspired design
 * Includes hero section, features, benefits, and call-to-action buttons
 */
export default function Landing() {
  const navigate = useNavigate();
  const { isSignedIn, user, isLoaded } = useUser();

  // This part of the code automatically redirects signed-in users to dashboard
  // Only redirect after authentication state is fully loaded
  React.useEffect(() => {
    if (isLoaded && isSignedIn && window.location.pathname === '/') {
      console.log('🔒 User is signed in on landing page, redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  // This part of the code shows loading state while authentication is being determined
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading CargoCore...</p>
        </div>
      </div>
    );
  }

  // This part of the code handles navigation to dashboard for signed-in users
  const handleGetDemo = () => {
    if (isSignedIn) {
      navigate('/dashboard');
    }
    // If not signed in, the SignInButton will handle the sign-in flow
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">CargoCore</div>
              <div className="ml-2 text-sm text-gray-500">3PL Operations Platform</div>
            </div>
            
            {/* Navigation Actions */}
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={handleGetDemo}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Go to Dashboard
                  </Button>
                  <UserButton />
                </div>
              ) : (
                <SignInButton mode="modal">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 !text-white border-0"
                  >
                    Get Demo
                  </Button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Optimize your{' '}
                <span className="text-blue-600">3PL operations</span>{' '}
                with AI-powered insights
              </h1>
              
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                Transform your logistics operations with real-time analytics, AI-driven insights, 
                and automated workflows. Get instant visibility into your supply chain performance.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                {isSignedIn ? (
                  <Button 
                    onClick={handleGetDemo}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
                    size="lg"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <SignInButton mode="modal">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 !text-white px-8 py-4 text-lg font-semibold"
                      size="lg"
                    >
                      Get Demo
                    </Button>
                  </SignInButton>
                )}
                <Button 
                  variant="outline" 
                  asChild
                  className="border-gray-700 text-gray-900 hover:bg-gray-100 hover:text-black px-8 py-4 text-lg font-semibold bg-white"
                  size="lg"
                >
                  <Link to="/contact">Get Started</Link>
                </Button>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                See results in minutes. Connect to your data instantly.
              </p>
            </div>
            
            {/* Hero Visual */}
            <div className="relative">
              <div className="bg-white rounded-lg shadow-2xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Operational Overview</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Live Data</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">2,452</div>
                      <div className="text-sm text-gray-600">Products Managed</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">98.5%</div>
                      <div className="text-sm text-gray-600">SLA Performance</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">7,672</div>
                      <div className="text-sm text-gray-600">Shipments</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">$150K</div>
                      <div className="text-sm text-gray-600">Cost Savings</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-500 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Insights Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Instant insights. Lasting growth.{' '}
                <span className="text-blue-600">Powered by AI.</span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-8">
                AI-driven analytics and real-time monitoring help you identify optimization 
                opportunities, predict issues before they happen, and make data-driven decisions 
                that improve your bottom line.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Predictive Analytics</h4>
                    <p className="text-gray-600">Forecast demand, identify bottlenecks, and optimize inventory levels</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Cost Optimization</h4>
                    <p className="text-gray-600">Reduce operational costs through intelligent resource allocation</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Performance Monitoring</h4>
                    <p className="text-gray-600">Track SLAs, monitor KPIs, and ensure operational excellence</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI Insights Visual */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-8 text-white">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">AI Insights Dashboard</h3>
                
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium">Optimization Opportunity</span>
                  </div>
                  <p className="text-sm opacity-90">
                    Consolidating shipments to Zone 7 could reduce costs by 23% 
                    and improve delivery times by 1.2 days.
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm font-medium">Predictive Alert</span>
                  </div>
                  <p className="text-sm opacity-90">
                    Inventory levels for SKU-1247 trending toward stockout. 
                    Recommend reorder within 5 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to optimize your 3PL operations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and insights to streamline your logistics operations 
              and drive growth for your business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Analytics</h3>
              <p className="text-gray-600">
                Get instant visibility into your operations with live dashboards and real-time KPI monitoring.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Insights</h3>
              <p className="text-gray-600">
                Leverage machine learning to identify patterns, predict trends, and optimize operations.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">SLA Monitoring</h3>
              <p className="text-gray-600">
                Track service level agreements and ensure consistent performance across all operations.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cost Management</h3>
              <p className="text-gray-600">
                Optimize costs across your entire operation with intelligent resource allocation.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Performance Tracking</h3>
              <p className="text-gray-600">
                Monitor KPIs, track improvements, and measure ROI across all operational metrics.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Warehouse</h3>
              <p className="text-gray-600">
                Manage multiple warehouses and locations from a single, unified platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits / Value Proposition */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Trusted by 3PL operators managing complex supply chains
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">2,500+</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Products Tracked</div>
              <div className="text-gray-600">Real-time inventory visibility across multiple warehouses and SKUs</div>
            </div>
            
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-2">7,600+</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Shipments Processed</div>
              <div className="text-gray-600">End-to-end tracking with predictive analytics and SLA monitoring</div>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Insights</div>
              <div className="text-gray-600">Continuous monitoring with automated alerts and optimization recommendations</div>
            </div>
          </div>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built for operations teams who need instant visibility, predictive insights, 
            and the ability to optimize costs while maintaining excellent service levels.
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to optimize your 3PL operations?
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join leading logistics companies using CargoCore to drive efficiency, 
            reduce costs, and deliver exceptional results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isSignedIn ? (
              <Button 
                onClick={handleGetDemo}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
                size="lg"
              >
                Go to Dashboard
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 !text-white px-8 py-4 text-lg font-semibold"
                  size="lg"
                >
                  Get Demo
                </Button>
              </SignInButton>
            )}
            <Button 
              variant="outline" 
              asChild
              className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-semibold"
              size="lg"
            >
              <Link to="/contact">Get Started</Link>
            </Button>
          </div>
          
          <p className="text-sm text-gray-400 mt-6">
            See immediate results. Setup takes minutes, not months.
          </p>
        </div>
      </section>

      {/* Footer */}
      {/* Powered by Heft IQ Footer */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="flex items-center justify-center space-x-3">
          {/* Powered by text */}
          <span className="text-gray-500 text-sm">
            Powered by
          </span>
          
          {/* Heft IQ Logo */}
          <div className="flex items-center space-x-2">
            {/* This part of the code creates the Heft IQ logo using SVG */}
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-purple-600"
            >
              {/* Central hub */}
              <circle 
                cx="50" 
                cy="50" 
                r="12" 
                stroke="currentColor" 
                strokeWidth="3" 
                fill="none"
              />
              
              {/* Connecting lines and outer nodes */}
              {/* Top */}
              <line x1="50" y1="38" x2="50" y2="20" stroke="currentColor" strokeWidth="3"/>
              <circle cx="50" cy="15" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
              
              {/* Top Right */}
              <line x1="58.5" y1="41.5" x2="70.7" y2="29.3" stroke="currentColor" strokeWidth="3"/>
              <circle cx="75.3" cy="24.7" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
              
              {/* Right */}
              <line x1="62" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="3"/>
              <circle cx="85" cy="50" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
              
              {/* Bottom Right */}
              <line x1="58.5" y1="58.5" x2="70.7" y2="70.7" stroke="currentColor" strokeWidth="3"/>
              <circle cx="75.3" cy="75.3" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
              
              {/* Bottom */}
              <line x1="50" y1="62" x2="50" y2="80" stroke="currentColor" strokeWidth="3"/>
              <circle cx="50" cy="85" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
              
              {/* Bottom Left */}
              <line x1="41.5" y1="58.5" x2="29.3" y2="70.7" stroke="currentColor" strokeWidth="3"/>
              <circle cx="24.7" cy="75.3" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
              
              {/* Left */}
              <line x1="38" y1="50" x2="20" y2="50" stroke="currentColor" strokeWidth="3"/>
              <circle cx="15" cy="50" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
              
              {/* Top Left */}
              <line x1="41.5" y1="41.5" x2="29.3" y2="29.3" stroke="currentColor" strokeWidth="3"/>
              <circle cx="24.7" cy="24.7" r="5" stroke="currentColor" strokeWidth="3" fill="none"/>
            </svg>
            
            {/* This part of the code displays the Heft IQ text logo */}
            <span className="text-lg font-bold text-purple-600">HEFT IQ</span>
          </div>
        </div>
      </div>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">CargoCore</div>
            <p className="text-gray-600 mb-4">3PL Operations Platform</p>
            <p className="text-sm text-gray-500">© 2025 Heft IQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
