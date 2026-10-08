import React from 'react';
import { MapPin, Star, Sparkles, Check, ArrowRight } from 'lucide-react';
import Container from '../components/common/Container';
import PageHeader from '../components/common/PageHeader';
import SectionTitle from '../components/common/SectionTitle';
import Button from '../components/common/Button';
import { destinationsData } from '../data/destinations';

export const DestinationsPage = () => {
  return (
    <div className="w-full pb-20">
      <PageHeader
        badge="Destinations"
        title="Popular Destinations"
        subtitle="Explore top international hubs and cultural pilgrimage destinations."
        breadcrumbs={[{ label: 'Destinations' }]}
      />

      <Container className="mt-12">
        <SectionTitle
          badge="Global & Domestic"
          title="Where Do You Want to Go?"
          subtitle="Explore discounted flight routes, visa facilitation & tour itineraries"
          description="We offer dedicated visa services, ticket booking, and guidance for all these top destinations."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {destinationsData.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-[#0B2A6F] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{dest.rating}</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block mb-1">
                    {dest.popularFor}
                  </span>
                  <h3 className="text-2xl font-bold">{dest.name}</h3>
                  <p className="text-xs text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D71920]" />
                    {dest.country}
                  </p>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    {dest.tagline}
                  </p>

                  <div className="space-y-2 mb-6">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Top Highlights:
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {dest.highlights.map((item, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Fares starting from</span>
                    <span className="text-xl font-extrabold text-[#0B2A6F]">
                      {dest.startingPrice}
                    </span>
                  </div>

                  <Button to="/contact" variant="primary" size="sm">
                    Inquire Trip
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default DestinationsPage;
