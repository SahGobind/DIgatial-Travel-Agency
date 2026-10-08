import React from 'react';
import { 
  ShieldCheck, 
  Target, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Users 
} from 'lucide-react';
import Container from '../components/common/Container';
import PageHeader from '../components/common/PageHeader';
import SectionTitle from '../components/common/SectionTitle';
import Button from '../components/common/Button';

export const AboutPage = () => {
  return (
    <div className="w-full pb-20">
      <PageHeader
        badge="About Us"
        title="Digital World Tour & Travels"
        subtitle="Your trusted travel, flight and holiday tour partner in Janakpur Dham, Nepal."
        breadcrumbs={[{ label: 'About Us' }]}
      />

      <Container className="mt-12 space-y-16">
        {/* Mission & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D71920]">
              Who We Are
            </span>
            <h2 className="text-3xl font-extrabold text-[#0B2A6F] leading-tight">
              Leading Travel Agency in Janakpur Dham
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              <strong>Digital World Tour &amp; Travels</strong> is located at Thapa Chowk, Janakpur Dham, Nepal. We are dedicated to delivering world-class travel management services, including domestic and international flight ticketing, visa consulting, hotel bookings, and curated tour packages.
            </p>
            <p className="text-base text-slate-600 leading-relaxed">
              With a commitment to transparency, honesty, and rapid customer service, we take pride in helping thousands of travelers and pilgrims realize their dream journeys safely and affordably.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#172033]">Government Registered</h4>
                  <p className="text-xs text-slate-500">Fully licensed travel and tour operator in Nepal.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#172033]">24/7 Dedicated Support</h4>
                  <p className="text-xs text-slate-500">Direct phone and emergency assistance for travelers.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#0B2A6F] text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
            <h3 className="text-2xl font-bold text-white border-b border-blue-800 pb-4">
              Agency Information
            </h3>
            <div className="space-y-4 text-sm text-blue-100">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D71920] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Office Address</p>
                  <p className="text-xs text-blue-200 mt-0.5">Thapa Chowk, Janakpur Dham, Nepal</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Hotline Numbers</p>
                  <p className="text-xs text-blue-200 mt-0.5">9702022094 / 9812193621</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Our Motto</p>
                  <p className="text-xs text-blue-200 mt-0.5">"Your Journey, Our Responsibility"</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button to="/contact" variant="danger" size="md" className="w-full">
                Get in Touch
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AboutPage;
