'use client';

import PublicLayout from '@/components/layouts/PublicLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Trophy, Target, BookOpen, Users, TrendingUp, Award, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-primary/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-400/20 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="w-full max-w-5xl mx-auto text-center z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 text-red-600 font-medium text-sm">
            <Award className="w-4 h-4" />
            <span>The #1 Mathematics Platform</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold text-gray-900 mb-6 leading-tight">
            Master Mathematics <br/> with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
              Mathlers
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Practice, Compete, and Excel in Mathematics with our highly engaging and competitive learning platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button className="glass-button text-white px-10 py-4 text-lg font-semibold flex items-center gap-2">
              Start Learning <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="px-10 py-4 text-lg font-semibold border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition-all">
              View Competitions
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Mathlers?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to improve your mathematical skills in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Structured Practice", desc: "Chapter-wise and topic-wise practice sets designed for effective learning." },
              { icon: Trophy, title: "Competitions", desc: "Participate in daily, weekly, and national competitions to test your skills." },
              { icon: TrendingUp, title: "Progress Tracking", desc: "Detailed analytics to track your improvement and identify areas for growth." },
              { icon: Award, title: "Achievements", desc: "Earn badges, certificates, and build your digital Mathlers identity." },
              { icon: Users, title: "Leaderboards", desc: "Compete with students nationwide and climb the rankings." },
              { icon: BookOpen, title: "Comprehensive Content", desc: "Extensive question bank covering all grades and topics." }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-8 text-center hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-red-600 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-red-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section id="journey" className="py-24 px-6 bg-gradient-to-b from-white to-red-50/50">
        <div className="w-full max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Competition Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four simple steps to mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { step: 1, title: "Register", desc: "Create your account and get your unique Mathlers Player ID." },
              { step: 2, title: "Practice", desc: "Complete daily challenges and practice sets to improve your skills." },
              { step: 3, title: "Compete", desc: "Join competitions and test your knowledge against other students." },
              { step: 4, title: "Achieve", desc: "Earn certificates, badges, and climb the leaderboards." }
            ].map((item, i) => (
              <div key={i} className="glass-card p-8 flex items-start gap-6 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-red-900/5 -z-10"></div>
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: "10,000+", label: "Active Students" },
              { val: "500+", label: "Schools" },
              { val: "50,000+", label: "Questions" },
              { val: "100+", label: "Competitions" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6">
                <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 mb-2">{stat.val}</p>
                <p className="text-lg text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-6">
            {[
              { q: "Is Mathlers free to use?", a: "Yes, Mathlers offers free registration and access to basic practice sets. Premium features are available for advanced users." },
              { q: "What grades does Mathlers support?", a: "Mathlers supports students from Grade 1 to Grade 12, covering all major mathematics topics." },
              { q: "How do I participate in competitions?", a: "Register for an account, browse upcoming competitions, and enroll before the registration deadline. Make sure to read the rulebook before joining." },
              { q: "Can schools register on Mathlers?", a: "Yes, schools can register and have coordinators manage their students, track performance, and participate in school-specific competitions." }
            ].map((faq, i) => (
              <div key={i} className="glass-card p-6 md:p-8 hover:border-red-300 transition-colors">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-gradient-to-b from-white to-red-50/30">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-xl text-gray-600">Have questions? We'd love to hear from you.</p>
          </div>
          <div className="glass-card p-8 md:p-10 shadow-xl">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input type="text" className="glass-input w-full px-4 py-3 bg-white/50" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" className="glass-input w-full px-4 py-3 bg-white/50" placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows={5} className="glass-input w-full px-4 py-3 bg-white/50 resize-none" placeholder="How can we help you?" />
              </div>
              <Button className="glass-button w-full py-4 text-lg font-bold text-white shadow-lg hover:shadow-red-500/30">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
