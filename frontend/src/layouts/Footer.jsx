import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  Plane, 
  ArrowRight,
  ShieldCheck,
  Award,
  Clock,
  Heart,
  QrCode
} from 'lucide-react';
import Container from '../components/common/Container';
import { useLanguage } from '../context/LanguageContext';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { language, t } = useLanguage();

  return (
    <footer className="bg-[#0B2A6F] text-white pt-16 pb-8 border-t-4 border-[#D71920]">
      <Container>
        {/* Nepal Payment Gateways & QR Banner */}
        <div className="mb-12 p-6 rounded-2xl bg-blue-950/70 border border-blue-800/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                {language === 'ne' ? 'नेपालका सबै डिजिटल वालेट तथा मोबाइल बैंकिङ स्वीकार्य' : 'Instant Nepal Digital Wallets & Mobile Banking Accepted'}
              </h4>
              <p className="text-xs text-blue-200 mt-0.5">
                {language === 'ne' 
                  ? 'इ-सेवा, खल्ती, फोनपे, कनेक्ट आइपिएस, भिसा / मास्टर कार्ड तथा जनकपुर काउन्टर नगद' 
                  : 'eSewa, Khalti, Fonepay QR, ConnectIPS, Debit/Credit Cards & Cash Counter'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-extrabold tracking-wide">
              eSewa (इ-सेवा)
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-extrabold tracking-wide">
              Khalti (खल्ती)
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-extrabold tracking-wide">
              Fonepay (फोनपे)
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-extrabold tracking-wide">
              ConnectIPS
            </span>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-blue-900/60">
          {/* Brand & Agency Bio */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#0B2A6F] shadow-lg">
                <div className="relative">
                  <Globe className="w-6 h-6 text-[#0B2A6F]" />
                  <Plane className="w-3.5 h-3.5 absolute -top-1 -right-1 text-[#D71920]" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white leading-none">
                  {language === 'ne' ? 'डिजिटल वर्ल्ड' : 'DIGITAL WORLD'}
                </span>
                <span className="text-xs font-bold tracking-widest text-[#D71920] uppercase mt-1">
                  {language === 'ne' ? 'टुर एण्ड ट्राभल्स (जनकपुर)' : 'Tour & Travels'}
                </span>
              </div>
            </Link>

            <p className="text-sm text-blue-100/90 leading-relaxed pr-4">
              {language === 'ne'
                ? 'जनकपुरधाम र काठमाडौँबाट नेपाल तथा विश्वभरका लागि आधिकारिक उडान टिकट, भिसा कन्सल्टेन्सी, होटल बुकिङ तथा टुर प्याकेज सेवा।'
                : 'Your premier partner for domestic & international flight tickets, visa processing, hotel accommodations, and curated holiday packages based in Janakpur Dham, Nepal.'}
            </p>

            {/* Value Badges & Social Links */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs text-blue-200">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'ne' ? 'नेपाल सरकार दर्ता नं. 192837' : 'Govt. Regd. #192837'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                {language === 'ne' ? 'सुलभ दर र सुरक्षित सेवा' : 'Best Rates & Support'}
              </span>
            </div>

            {/* Social Media Links */}
            <div className="pt-2 flex items-center gap-2 text-blue-200">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Page"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#D71920] hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              >
                FB
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Profile"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#D71920] hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              >
                IG
              </a>
              <a
                href="https://wa.me/9779702022094"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Chat"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              >
                WA
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 sm:col-span-1">
            <h3 className="text-base font-bold uppercase tracking-wider text-white mb-4 relative inline-block">
              {language === 'ne' ? 'मुख्य लिङ्कहरू' : 'Quick Links'}
              <span className="block h-0.5 w-8 bg-[#D71920] mt-1"></span>
            </h3>
            <ul className="space-y-2.5 text-sm text-blue-100">
              <li>
                <Link to="/" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3 h-3 text-[#D71920]" />
                  {t('navHome')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3 h-3 text-[#D71920]" />
                  {t('navAbout')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3 h-3 text-[#D71920]" />
                  {t('navServices')}
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3 h-3 text-[#D71920]" />
                  {t('navDestinations')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3 h-3 text-[#D71920]" />
                  {t('navContact')}
                </Link>
              </li>
              <li>
                <Link to="/payments" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3 h-3 text-[#D71920]" />
                  {language === 'ne' ? 'अनलाइन भुक्तानी' : 'Pay Online'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Links */}
          <div className="lg:col-span-3 sm:col-span-1">
            <h3 className="text-base font-bold uppercase tracking-wider text-white mb-4 relative inline-block">
              {language === 'ne' ? 'हाम्रा सेवाहरू' : 'Our Services'}
              <span className="block h-0.5 w-8 bg-[#D71920] mt-1"></span>
            </h3>
            <ul className="space-y-2.5 text-sm text-blue-100">
              <li>
                <Link to="/services" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3 h-3 text-[#D71920]" />
                  {language === 'ne' ? 'आन्तरिक तथा अन्तर्राष्ट्रिय उडान' : 'Air Ticketing (Domestic & Intl)'}
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3 h-3 text-[#D71920]" />
                  {language === 'ne' ? 'भिसा प्रोसेसिङ (दुबई, कतार, युरोप)' : 'Visa Application & Support'}
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3 h-3 text-[#D71920]" />
                  {language === 'ne' ? 'होटल तथा रिसोर्ट बुकिङ' : 'Hotel & Resort Bookings'}
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3 h-3 text-[#D71920]" />
                  {language === 'ne' ? 'छुट्टी तथा टुर प्याकेज' : 'Holiday & Vacation Packages'}
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3 h-3 text-[#D71920]" />
                  {language === 'ne' ? 'जनकपुरधाम र मिथिला दर्शन' : 'Janakpur Dham & Mithila Tours'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-3">
            <h3 className="text-base font-bold uppercase tracking-wider text-white mb-4 relative inline-block">
              {language === 'ne' ? 'ठेगाना र सम्पर्क' : 'Visit & Contact'}
              <span className="block h-0.5 w-8 bg-[#D71920] mt-1"></span>
            </h3>
            <div className="space-y-3.5 text-sm text-blue-100">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D71920] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">{language === 'ne' ? 'कार्यालय ठेगाना' : 'Office Location'}</p>
                  <p className="text-xs text-blue-200 mt-0.5">
                    {language === 'ne' ? 'थापा चोक, जनकपुरधाम, धनुषा, मधेस प्रदेश, नेपाल' : 'Thapa Chowk, Janakpur Dham, Dhanusha, Nepal'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">{language === 'ne' ? 'फोन तथा व्हाट्सएप' : 'Call / WhatsApp'}</p>
                  <p className="text-xs text-blue-200 mt-0.5">
                    <a href="tel:9702022094" className="hover:underline">९७०२०२२०९४</a>
                    {' '} / {' '}
                    <a href="tel:9812193621" className="hover:underline">९८१२१९३६२१</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">{language === 'ne' ? 'कार्यालय समय' : 'Working Hours'}</p>
                  <p className="text-xs text-blue-200 mt-0.5">
                    {language === 'ne' ? 'आइतबार - शनिबार: बिहान ८:०० - साँझ ७:००' : 'Sun - Sat: 8:00 AM - 7:00 PM'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-200/80 gap-4">
          <p>
            &copy; {currentYear} <span className="text-white font-semibold">{language === 'ne' ? 'डिजिटल वर्ल्ड टुर एण्ड ट्राभल्स' : 'Digital World Tour & Travels'}</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-[#D71920] fill-[#D71920]" /> for Nepal &amp; Global Travelers
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

