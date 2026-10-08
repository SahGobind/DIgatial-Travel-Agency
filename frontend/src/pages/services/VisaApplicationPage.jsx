import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { 
  FileCheck, 
  UploadCloud, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  Globe2, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Calendar, 
  Flag, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  PhoneCall, 
  AlertCircle
} from 'lucide-react';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { visaService } from '../../services';
import { useAuth } from '../../context/AuthContext';

export const VisaApplicationPage = () => {
  const { user, loginAsDemoCustomer, isAuthenticated } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [rawFiles, setRawFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [apiError, setApiError] = useState('');
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      country: 'UAE (Dubai)',
      visaType: 'Tourist Visa',
      fullName: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      passportNumber: '',
      travelDate: '',
      nationality: 'Nepalese',
    },
  });

  const countries = [
    'UAE (Dubai)',
    'Qatar',
    'Saudi Arabia',
    'Malaysia',
    'Kuwait',
    'Oman',
    'Bahrain',
    'Thailand',
    'Singapore',
    'Europe (Schengen)',
    'United Kingdom',
    'Japan',
    'Other Destination',
  ];

  const visaTypes = [
    'Tourist Visa',
    'Work Visa',
    'Business Visa',
    'Student Visa',
  ];

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      addFiles(e.target.files);
    }
  };

  const addFiles = (files) => {
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const newFilesList = [...selectedFiles];
    const newRawList = [...rawFiles];

    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop().toLowerCase();
      if (validExtensions.includes(ext)) {
        const fileObj = {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2), // MB
          type: file.type || ext.toUpperCase(),
        };
        newFilesList.push(fileObj);
        newRawList.push(file);
      }
    });

    setSelectedFiles(newFilesList);
    setRawFiles(newRawList);
  };

  const removeFile = (id, index) => {
    setSelectedFiles(selectedFiles.filter((f) => f.id !== id));
    setRawFiles(rawFiles.filter((_, idx) => idx !== index));
  };

  const onSubmit = async (data) => {
    try {
      setApiError('');
      if (!isAuthenticated) {
        try {
          await loginAsDemoCustomer();
        } catch (authErr) {
          // continue
        }
      }

      // 1. Submit Visa Application
      const visaResponse = await visaService.createVisa(data);

      // 2. Upload Documents if any
      if (rawFiles.length > 0 && visaResponse.id) {
        for (const file of rawFiles) {
          try {
            await visaService.uploadDocument(visaResponse.id, file, 'PASSPORT');
          } catch (uploadErr) {
            console.warn('Document upload warning:', uploadErr);
          }
        }
      }

      const referenceId = `DW-VSA-${new Date().getFullYear()}-${visaResponse.id || Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedData({
        ...data,
        referenceId,
        id: visaResponse.id,
        filesCount: selectedFiles.length,
        fileNames: selectedFiles.map((f) => f.name),
      });
      setIsSuccessModalOpen(true);
    } catch (err) {
      setApiError(err.customMessage || err.message || 'Failed to submit visa application. Please verify your details.');
    }
  };

  const handleResetForm = () => {
    reset();
    setSelectedFiles([]);
    setRawFiles([]);
    setIsSuccessModalOpen(false);
    setSubmittedData(null);
  };

  return (
    <div className="w-full pb-20">
      {/* Page Header */}
      <PageHeader
        badge="Visa Assistance"
        title="Visa Application"
        subtitle="Let us help you with a smooth visa process."
        breadcrumbs={[
          { label: 'Services', to: '/services' },
          { label: 'Visa Application' },
        ]}
      />

      <Container className="mt-10 sm:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* LEFT: VISA APPLICATION FORM */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 pb-5 mb-6">
              <h2 className="text-2xl font-extrabold text-[#0B2A6F]">
                Visa Application Details
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Provide your travel and applicant information for quick visa evaluation and consular guidance.
              </p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Country & Visa Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Destination Country */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Destination Country *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Globe2 className="w-4 h-4 text-[#0B2A6F]" />
                    </div>
                    <select
                      {...register('country', { required: 'Country is required' })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] focus:border-transparent transition"
                    >
                      {countries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.country && (
                    <span className="text-xs text-red-600 mt-1 block">
                      {errors.country.message}
                    </span>
                  )}
                </div>

                {/* Visa Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Visa Type *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FileCheck className="w-4 h-4 text-[#D71920]" />
                    </div>
                    <select
                      {...register('visaType', { required: 'Visa type is required' })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] focus:border-transparent transition"
                    >
                      {visaTypes.map((vt) => (
                        <option key={vt} value={vt}>
                          {vt}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.visaType && (
                    <span className="text-xs text-red-600 mt-1 block">
                      {errors.visaType.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Applicant Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name (As on Passport) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Sonu Kumar"
                      {...register('fullName', {
                        required: 'Full name is required',
                        minLength: { value: 2, message: 'Name too short' },
                      })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] focus:border-transparent transition"
                    />
                  </div>
                  {errors.fullName && (
                    <span className="text-xs text-red-600 mt-1 block">
                      {errors.fullName.message}
                    </span>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      placeholder="9812193621"
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[0-9+ ]{7,15}$/,
                          message: 'Please enter a valid phone number',
                        },
                      })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] focus:border-transparent transition"
                    />
                  </div>
                  {errors.phone && (
                    <span className="text-xs text-red-600 mt-1 block">
                      {errors.phone.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Email & Passport Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      placeholder="sonu@example.com"
                      {...register('email', {
                        required: 'Email address is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] focus:border-transparent transition"
                    />
                  </div>
                  {errors.email && (
                    <span className="text-xs text-red-600 mt-1 block">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Passport Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Passport Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="PA1234567"
                      {...register('passportNumber', {
                        required: 'Passport number is required',
                        minLength: { value: 5, message: 'Passport number too short (minimum 5 chars)' },
                      })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] focus:border-transparent transition"
                    />
                  </div>
                  {errors.passportNumber && (
                    <span className="text-xs text-red-600 mt-1 block">
                      {errors.passportNumber.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Travel Date & Nationality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Expected Travel Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Expected Travel Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...register('travelDate', { required: 'Travel date is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] focus:border-transparent transition"
                    />
                  </div>
                  {errors.travelDate && (
                    <span className="text-xs text-red-600 mt-1 block">
                      {errors.travelDate.message}
                    </span>
                  )}
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nationality
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Flag className="w-4 h-4 text-emerald-600" />
                    </div>
                    <input
                      type="text"
                      {...register('nationality')}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              {/* DRAG-AND-DROP DOCUMENT UPLOAD AREA */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Upload Documents (Passport Copy, Photo, Itinerary)
                </label>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 sm:p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-200 ${
                    dragActive
                      ? 'border-[#0B2A6F] bg-blue-50/70 scale-[1.01]'
                      : 'border-slate-300 hover:border-[#0B2A6F] bg-[#F5F8FC]/60 hover:bg-blue-50/30'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0B2A6F] flex items-center justify-center mx-auto mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#172033]">
                    Click to upload or drag and drop
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    (Passport copy, photo, or other documents • PDF, JPG, PNG up to 10MB)
                  </p>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Attached Files ({selectedFiles.length}):
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2 overflow-hidden pr-2">
                            <FileText className="w-4 h-4 text-[#0B2A6F] shrink-0" />
                            <div className="truncate">
                              <p className="font-semibold text-slate-800 truncate">
                                {file.name}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {file.size} MB
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(file.id, idx);
                            }}
                            className="p-1 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                            aria-label="Remove File"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="danger"
                  size="lg"
                  icon={Send}
                  isLoading={isSubmitting}
                  className="w-full justify-center shadow-md py-3.5"
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </div>

          {/* RIGHT: SIDE PROMOTIONAL PANEL */}
          <div className="lg:col-span-4 space-y-6">
            {/* Visual Skyscraper Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900 text-white flex flex-col justify-between min-h-[460px]">
              <img
                src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80"
                alt="Explore New Opportunities skyscraper visual"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B2A6F] via-[#0B2A6F]/70 to-black/40"></div>

              {/* Card Header */}
              <div className="relative z-10 p-6 sm:p-8 space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500 text-white">
                  Fast Processing
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Explore <br />New Opportunities
                </h3>
                <p className="text-xs text-blue-100 leading-relaxed">
                  End-to-end visa counseling, document preparation, and submission tracking from Janakpur Dham.
                </p>
              </div>

              {/* 4 Visa Type Checkmarks */}
              <div className="relative z-10 p-6 sm:p-8 space-y-3 bg-black/30 backdrop-blur-sm border-t border-white/10">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Tourist Visa (Dubai, Malaysia, Europe)</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Work Visa (Gulf &amp; International)</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Business Visa (Trade &amp; Corporate)</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Student Visa (University Admissions)</span>
                </div>
              </div>
            </div>

            {/* Helpline Box */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-[#0B2A6F] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Expert Visa Evaluation</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bring your documents to our Janakpur Dham office at Thapa Chowk for an instant in-person assessment:
              </p>
              <div className="pt-1 flex flex-col gap-1 text-sm font-bold text-[#0B2A6F]">
                <a href="tel:9702022094" className="hover:text-[#D71920] transition-colors">
                  📞 9702022094
                </a>
                <a href="tel:9812193621" className="hover:text-[#D71920] transition-colors">
                  📞 9812193621
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* SUCCESS CONFIRMATION MODAL */}
      {isSuccessModalOpen && submittedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Application Received
              </span>
              <h3 className="text-2xl font-extrabold text-[#0B2A6F]">
                Visa Application Submitted!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Your visa application has been submitted successfully to the database. Our visa specialists will review your documents and contact you shortly.
              </p>
            </div>

            {/* Summary Pill */}
            <div className="p-4 rounded-2xl bg-[#F5F8FC] border border-slate-200 text-left space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Reference ID:</span>
                <span className="font-extrabold text-[#0B2A6F] font-mono">
                  {submittedData.referenceId}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Destination:</span>
                <span className="font-bold text-[#172033]">
                  {submittedData.country}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Visa Type:</span>
                <span className="font-bold text-[#0B2A6F]">
                  {submittedData.visaType}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-[#172033]">
                  {submittedData.fullName}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Passport No:</span>
                <span className="font-bold text-[#172033]">
                  {submittedData.passportNumber}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Contact:</span>
                <span className="font-bold text-[#172033]">
                  {submittedData.phone}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500">Attached Documents:</span>
                <span className="font-bold text-emerald-700">
                  {submittedData.filesCount} file(s) attached
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={handleResetForm}
              >
                Close &amp; Submit Another
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisaApplicationPage;
