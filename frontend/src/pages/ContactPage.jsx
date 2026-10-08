import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  Globe 
} from 'lucide-react';
import Container from '../components/common/Container';
import PageHeader from '../components/common/PageHeader';
import SectionTitle from '../components/common/SectionTitle';
import Button from '../components/common/Button';

export const ContactPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    // Frontend foundation mock submission
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitted(true);
    reset();
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="w-full pb-20">
      <PageHeader
        badge="Reach Out"
        title="Contact Us"
        subtitle="We are here to assist your flight ticketing, visa and hotel queries."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <Container className="mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0B2A6F] text-white rounded-3xl p-8 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#D71920]">
                  Get In Touch
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  Digital World Tour &amp; Travels
                </h3>
                <p className="text-xs text-blue-200 mt-2">
                  Visit our Janakpur Dham branch or call us anytime for instant ticketing and visa support.
                </p>
              </div>

              <div className="space-y-4 text-sm text-blue-100 pt-2 border-t border-blue-800">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-[#D71920] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Office Address</h4>
                    <p className="text-xs text-blue-200 mt-0.5">
                      Thapa Chowk, Janakpur Dham, Dhanusha, Nepal
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Direct Phone Numbers</h4>
                    <p className="text-xs text-blue-200 mt-0.5">
                      <a href="tel:9702022094" className="hover:underline">9702022094</a>
                      {' '} / {' '}
                      <a href="tel:9812193621" className="hover:underline">9812193621</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Office Hours</h4>
                    <p className="text-xs text-blue-200 mt-0.5">
                      Sunday to Saturday: 8:00 AM – 7:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Note */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-[#172033] mb-2">
                Visiting Janakpur Dham?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our office is centrally located at Thapa Chowk, easily accessible from all major landmarks including Janaki Mandir and Ramanand Chowk.
              </p>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-extrabold text-[#172033] mb-2">
              Send an Inquiry
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Fill in your contact details and service requirements. Our travel advisor will contact you promptly.
            </p>

            {isSubmitted && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-sm font-semibold">
                  Thank you! Your inquiry has been received. We will call you soon.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Sonu Kumar"
                    {...register('fullName', { required: 'Full name is required' })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] focus:border-transparent transition"
                  />
                  {errors.fullName && (
                    <span className="text-xs text-red-600 mt-1 block">
                      {errors.fullName.message}
                    </span>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Phone / Mobile *
                  </label>
                  <input
                    type="tel"
                    placeholder="9812193621"
                    {...register('phone', { required: 'Phone number is required' })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] focus:border-transparent transition"
                  />
                  {errors.phone && (
                    <span className="text-xs text-red-600 mt-1 block">
                      {errors.phone.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    {...register('email')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] focus:border-transparent transition"
                  />
                </div>

                {/* Service Needed */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Service Required *
                  </label>
                  <select
                    {...register('serviceType', { required: 'Please select a service' })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] focus:border-transparent transition"
                  >
                    <option value="">Select a service...</option>
                    <option value="flight">Air Ticketing (Domestic / Intl)</option>
                    <option value="visa">Visa Assistance</option>
                    <option value="hotel">Hotel Booking</option>
                    <option value="tour">Tour & Holiday Package</option>
                  </select>
                  {errors.serviceType && (
                    <span className="text-xs text-red-600 mt-1 block">
                      {errors.serviceType.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Message / Details
                </label>
                <textarea
                  rows="4"
                  placeholder="Tell us your travel dates, destination, or specific requirements..."
                  {...register('message')}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] focus:border-transparent transition resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="danger"
                  size="lg"
                  icon={Send}
                  isLoading={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Send Inquiry
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ContactPage;
