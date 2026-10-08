import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plane, 
  FileCheck, 
  Building2, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight, 
  ChevronDown, 
  MapPin, 
  Star,
  ShieldCheck, 
  Users, 
  BadgePercent, 
  Globe2, 
  Compass, 
  Headphones, 
  Award,
  PhoneCall
} from 'lucide-react';
import Container from '../components/common/Container';
import PageHeader from '../components/common/PageHeader';
import SectionTitle from '../components/common/SectionTitle';
import Button from '../components/common/Button';
import { 
  mainServicesData, 
  whyChooseServicesData, 
  serviceProcessSteps, 
  serviceFaqsData 
} from '../data/services';
import { destinationsData } from '../data/destinations';

export const ServicesPage = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Helper function to map string icon names to Lucide components
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Plane':
        return Plane;
      case 'FileCheck':
      case 'Passport':
        return FileCheck;
      case 'Building2':
      case 'Hotel':
        return Building2;
      case 'Briefcase':
        return Briefcase;
      default:
        return Compass;
    }
  };

  const whyChooseIcons = [
    Users,
    ShieldCheck,
    BadgePercent,
    Headphones,
    Award,
    Globe2,
  ];

  const processIcons = [
    Compass,
    FileCheck,
    PhoneCall,
    Plane,
  ];

  return (
    <div className="w-full pb-20">
      {/* 1. PAGE HEADER */}
      <PageHeader
        badge="Our Offerings"
        title="Our Services"
        subtitle="Complete travel solutions under one roof"
        breadcrumbs={[{ label: 'Services' }]}
      />

      {/* 2. MAIN SERVICES (3 Pillar Cards) */}
      <section className="py-14 sm:py-20">
        <Container>
          <SectionTitle
            badge="All-In-One Travel"
            title="Comprehensive Services"
            subtitle="Tailored to meet domestic and international travel needs"
            description="Explore our core offerings spanning flight reservations, consular visa guidance, and global hotel bookings."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {mainServicesData.map((service) => {
              const IconComponent = getIcon(service.icon);
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col group"
                >
                  {/* Card Image Banner */}
                  <div className="relative h-56 sm:h-64 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"></div>
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 text-[#0B2A6F] shadow-md backdrop-blur-sm">
                        {service.badge}
                      </span>
                    </div>

                    {/* Floating Icon */}
                    <div className="absolute top-4 right-4 w-11 h-11 rounded-2xl bg-[#0B2A6F]/90 text-white flex items-center justify-center shadow-lg backdrop-blur-sm">
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-4 left-6 right-6 text-white">
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        {service.title}
                      </h3>
                      {service.countries && (
                        <p className="text-xs text-amber-300 font-semibold mt-1">
                          Countries: {service.countries.join(' • ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-5">
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        {service.description}
                      </p>

                      <div className="space-y-2.5 pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Included Features:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {service.features.map((feature, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-lg"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-slate-100">
                      <Button
                        to={service.route}
                        variant="danger"
                        size="md"
                        icon={ArrowRight}
                        iconPosition="right"
                        className="w-full justify-center shadow-sm"
                      >
                        {service.buttonText}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 3. POPULAR TRAVEL DESTINATIONS */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-200">
        <Container>
          <SectionTitle
            badge="Top Hubs"
            title="Popular Travel Destinations"
            subtitle="Explore discounted flight routes, visa facilitation & hotel stays"
            description="Our travel team in Janakpur Dham provides dedicated assistance for these top destinations."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {destinationsData.slice(0, 4).map((dest) => (
              <div
                key={dest.id}
                className="group rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
                  
                  <div className="absolute top-3 right-3 bg-white/95 text-[#0B2A6F] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{dest.rating}</span>
                  </div>

                  <div className="absolute bottom-3 left-3 text-white">
                    <h4 className="text-xl font-bold">{dest.name}</h4>
                    <p className="text-xs text-blue-100 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D71920]" />
                      {dest.country}
                    </p>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {dest.tagline}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Fares from</span>
                      <span className="text-base font-extrabold text-[#0B2A6F]">
                        {dest.startingPrice}
                      </span>
                    </div>

                    <Button to="/destinations" variant="primary" size="sm">
                      Explore
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. WHY CHOOSE OUR SERVICES */}
      <section className="py-16 md:py-24 bg-[#F5F8FC] border-t border-slate-200">
        <Container>
          <SectionTitle
            badge="Our Distinction"
            title="Why Choose Us?"
            subtitle="Built on reliability, expertise, and personalized client support"
            description="We ensure your international journeys and domestic flight bookings are handled with precision."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
            {whyChooseServicesData.map((item, idx) => {
              const IconComp = whyChooseIcons[idx] || ShieldCheck;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B2A6F] flex items-center justify-center mb-5">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#172033] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 5. SERVICE PROCESS ("How Our Service Works") */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-200">
        <Container>
          <SectionTitle
            badge="Simple Process"
            title="How Our Service Works"
            subtitle="From initial consultation to ticket delivery and destination arrival"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
            {serviceProcessSteps.map((step, idx) => {
              const StepIcon = processIcons[idx] || Compass;
              return (
                <div
                  key={idx}
                  className="relative bg-[#F5F8FC] rounded-2xl p-7 border border-slate-200 text-center flex flex-col items-center group hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-300"
                >
                  <span className="absolute -top-4 bg-[#0B2A6F] text-white text-xs font-extrabold px-3.5 py-1 rounded-full shadow-md">
                    Step {step.step}
                  </span>

                  <div className="w-14 h-14 rounded-2xl bg-white text-[#0B2A6F] shadow-sm flex items-center justify-center my-4 group-hover:scale-110 group-hover:bg-[#0B2A6F] group-hover:text-white transition-all duration-200">
                    <StepIcon className="w-7 h-7" />
                  </div>

                  <h3 className="text-base font-bold text-[#172033] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 6. SERVICE FAQ SECTION */}
      <section className="py-16 md:py-24 bg-[#F5F8FC] border-t border-slate-200">
        <Container size="narrow">
          <SectionTitle
            badge="Service Help"
            title="Frequently Asked Questions"
            subtitle="Find answers to common questions about our travel &amp; employment services"
          />

          <div className="mt-12 space-y-3.5">
            {serviceFaqsData.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-[#0B2A6F] bg-blue-50/30 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 sm:py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-[#172033] pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#0B2A6F] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ServicesPage;
