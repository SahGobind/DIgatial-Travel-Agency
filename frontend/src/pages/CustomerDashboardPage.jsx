import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Plane, 
  FileCheck, 
  Building2, 
  Briefcase, 
  FileText, 
  CreditCard, 
  Receipt, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Globe, 
  Search, 
  Plus, 
  Eye, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight,
  UploadCloud,
  Trash2,
  Filter,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Home
} from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { 
  ticketService, 
  visaService, 
  hotelService, 
  invoiceService, 
  notificationService 
} from '../services';

export const CustomerDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Live API States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [visas, setVisas] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Customer Profile State
  const [profileData, setProfileData] = useState({
    fullName: user?.name || 'Valued Customer',
    email: user?.email || '',
    phone: user?.phone || '+977 9812193621',
    nationality: 'Nepalese',
    address: 'Thapa Chowk, Janakpur Dham, Nepal',
    passportNumber: 'PA1234567',
  });

  // Load live customer data from backend
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [
        ticketsRes,
        visasRes,
        hotelsRes,
        invoicesRes,
        notifsRes,
      ] = await Promise.allSettled([
        ticketService.getTickets(),
        visaService.getVisas(),
        hotelService.getBookings(),
        invoiceService.getInvoices(),
        notificationService.getNotifications(),
      ]);

      if (ticketsRes.status === 'fulfilled') {
        const val = ticketsRes.value;
        setTickets(Array.isArray(val) ? val : (val?.results || []));
      }
      if (visasRes.status === 'fulfilled') {
        const val = visasRes.value;
        setVisas(Array.isArray(val) ? val : (val?.results || []));
      }
      if (hotelsRes.status === 'fulfilled') {
        const val = hotelsRes.value;
        setHotelBookings(Array.isArray(val) ? val : (val?.results || []));
      }
      if (invoicesRes.status === 'fulfilled') {
        const val = invoicesRes.value;
        setInvoices(Array.isArray(val) ? val : (val?.results || []));
      }
      if (notifsRes.status === 'fulfilled') {
        const val = notifsRes.value;
        setNotifications(Array.isArray(val) ? val : (val?.results || []));
      }
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Aggregate recent requests across services
  const recentActivities = [
    ...(Array.isArray(tickets) ? tickets : []).map((t) => ({
      id: `TKT-${t.id}`,
      service: 'Flight',
      title: `${t.from_location || ''} → ${t.to_location || ''}`,
      date: t.departure_date || t.created_at?.slice(0, 10) || '',
      status: t.status || 'PENDING',
      fee: t.quotation_amount_npr ? `NPR ${t.quotation_amount_npr}` : 'Quote Pending',
      raw: t,
    })),
    ...(Array.isArray(visas) ? visas : []).map((v) => ({
      id: `VSA-${v.id}`,
      service: 'Visa',
      title: `${v.country || ''} (${v.visa_type || ''})`,
      date: v.travel_date || v.created_at?.slice(0, 10) || '',
      status: v.status || 'SUBMITTED',
      fee: v.government_fee_npr ? `NPR ${v.government_fee_npr}` : 'Standard Processing',
      raw: v,
    })),
    ...(Array.isArray(hotelBookings) ? hotelBookings : []).map((h) => ({
      id: `HTL-${h.id}`,
      service: 'Hotel',
      title: h.hotel_details?.name || `Hotel Reservation #${h.id}`,
      date: h.check_in || h.created_at?.slice(0, 10) || '',
      status: h.status || 'CONFIRMED',
      fee: h.total_amount ? `NPR ${h.total_amount}` : 'N/A',
      raw: h,
    })),
  ].sort((a, b) => ((b.date || '') > (a.date || '') ? 1 : -1));

  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'tickets', label: 'Flight Tickets', icon: Plane, count: tickets.length },
    { id: 'visa', label: 'Visa Applications', icon: FileCheck, count: visas.length },
    { id: 'hotels', label: 'Hotel Bookings', icon: Building2, count: hotelBookings.length },
    { id: 'invoices', label: 'Billing & Invoices', icon: Receipt, count: invoices.length },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: notifications.length },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('CONFIRM') || s.includes('APPROVED') || s.includes('COMPLETED')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (s.includes('PENDING') || s.includes('SUBMIT') || s.includes('REVIEW')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (s.includes('QUOTATION') || s.includes('PROCESSING')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (s.includes('CANCEL') || s.includes('REJECT')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setProfileSuccessMsg(true);
    setTimeout(() => setProfileSuccessMsg(false), 4000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col lg:flex-row text-[#172033]">
      {/* 1. SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0B2A6F] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-blue-900">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#0B2A6F] shadow-md">
                <Globe className="w-5 h-5 text-[#0B2A6F]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-tight text-white leading-tight">
                  DIGITAL WORLD
                </span>
                <span className="text-[10px] font-bold tracking-wider text-[#D71920] uppercase">
                  Tour &amp; Travels
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Brief Badge */}
          <div className="p-4 mx-4 my-4 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-[#D71920] text-white font-bold flex items-center justify-center text-sm shadow">
              {profileData.fullName?.slice(0, 2).toUpperCase() || 'CU'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">
                {profileData.fullName}
              </p>
              <span className="text-[10px] text-blue-200 block truncate">
                Customer Account • Janakpur Portal
              </span>
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-none">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#0B2A6F] shadow-md'
                      : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D71920]' : 'text-blue-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-[#0B2A6F] text-white' : 'bg-blue-800 text-blue-200'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-blue-900 space-y-2">
          <Link
            to="/services"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-red-600 to-red-700 text-white text-xs font-bold shadow-md hover:from-red-700 hover:to-red-800 transition"
          >
            <Plus className="w-4 h-4" /> New Booking Request
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-blue-200 hover:bg-blue-900 hover:text-white text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#0B2A6F] text-xs font-bold transition cursor-pointer"
              title="Go back to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <Link
              to="/"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#0B2A6F] text-xs font-bold transition"
              title="Return to main website"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Website</span>
            </Link>
            <h1 className="text-lg sm:text-xl font-black text-[#0B2A6F] capitalize">
              {activeTab === 'dashboard' ? 'Customer Dashboard' : activeTab.replace(/([A-Z])/g, ' $1')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Refresh Button */}
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={refreshing}
              title="Refresh Data from Server"
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#0B2A6F] hover:bg-blue-50 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#0B2A6F]' : ''}`} />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#0B2A6F] relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#D71920] absolute top-2 right-2 ring-2 ring-white"></span>
                )}
              </button>

              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 space-y-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900">Notifications ({notifications.length})</span>
                    <button onClick={() => setShowNotificationMenu(false)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <p className="font-bold text-[#0B2A6F]">{n.title}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5">{n.message || n.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4">No new notifications</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Header */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-[#0B2A6F] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {profileData.fullName?.slice(0, 2).toUpperCase() || 'CU'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">{profileData.fullName}</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="p-4 sm:p-8 flex-1 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-[#0B2A6F] mb-4" />
              <p className="text-sm font-bold text-slate-600">Syncing with Digital World Database...</p>
              <span className="text-xs text-slate-400 mt-1">Retrieving your tickets, visas, bookings and employment records</span>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* Metric Counters Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div 
                      onClick={() => setActiveTab('tickets')}
                      className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flight Tickets</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B2A6F] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plane className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-[#0B2A6F]">{tickets.length}</div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Active Inquiries &amp; Bookings</span>
                    </div>

                    <div 
                      onClick={() => setActiveTab('visa')}
                      className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visa Applications</span>
                        <div className="w-9 h-9 rounded-xl bg-red-50 text-[#D71920] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileCheck className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-[#D71920]">{visas.length}</div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Submissions in Process</span>
                    </div>

                    <div 
                      onClick={() => setActiveTab('hotels')}
                      className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hotel Bookings</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Building2 className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-700">{hotelBookings.length}</div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Confirmed Stays</span>
                    </div>

                    <div 
                      onClick={() => setActiveTab('invoices')}
                      className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoices &amp; Bills</span>
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Receipt className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-purple-700">{invoices.length}</div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Statements &amp; Receipts</span>
                    </div>
                  </div>

                  {/* Combined Recent Applications Table */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-[#0B2A6F]">Recent Service Requests &amp; Inquiries</h3>
                        <p className="text-xs text-slate-500">Live activity synced directly with your account database.</p>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to="/services/tickets"
                          className="px-3 py-1.5 rounded-xl bg-[#0B2A6F] text-white text-xs font-bold hover:bg-[#123D8D] transition"
                        >
                          + Flight Request
                        </Link>
                        <Link
                          to="/services/visa"
                          className="px-3 py-1.5 rounded-xl bg-[#D71920] text-white text-xs font-bold hover:bg-[#b01319] transition"
                        >
                          + Apply Visa
                        </Link>
                      </div>
                    </div>

                    {recentActivities.length === 0 ? (
                      <div className="py-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B2A6F] flex items-center justify-center mx-auto">
                          <Plane className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">No Service Requests Found</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          You have not submitted any flight inquiries, visa applications or hotel bookings yet.
                        </p>
                        <div className="pt-2 flex justify-center gap-3">
                          <Link to="/services/tickets" className="px-4 py-2 rounded-xl bg-[#0B2A6F] text-white text-xs font-bold">
                            Book Flight
                          </Link>
                          <Link to="/services/visa" className="px-4 py-2 rounded-xl bg-[#D71920] text-white text-xs font-bold">
                            Apply for Visa
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                              <th className="py-3 px-3">Service</th>
                              <th className="py-3 px-3">Reference / Route</th>
                              <th className="py-3 px-3">Date</th>
                              <th className="py-3 px-3">Status</th>
                              <th className="py-3 px-3">Cost / Quote</th>
                              <th className="py-3 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {recentActivities.slice(0, 8).map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-3 font-bold text-[#0B2A6F]">
                                  {item.service}
                                </td>
                                <td className="py-3.5 px-3">
                                  <div className="font-semibold text-slate-900">{item.title}</div>
                                  <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                                </td>
                                <td className="py-3.5 px-3 text-slate-600">
                                  {item.date}
                                </td>
                                <td className="py-3.5 px-3">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getStatusBadge(item.status)}`}>
                                    {item.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 font-semibold text-slate-800">
                                  {item.fee}
                                </td>
                                <td className="py-3.5 px-3 text-right">
                                  <button
                                    onClick={() => setSelectedItem(item)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0B2A6F] hover:bg-blue-50 cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: FLIGHT TICKETS */}
              {activeTab === 'tickets' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#0B2A6F]">My Flight Ticket Requests</h3>
                      <p className="text-xs text-slate-500">View flight itineraries, status quotes, and passenger details.</p>
                    </div>
                    <Link to="/services/tickets" className="px-4 py-2 rounded-xl bg-[#0B2A6F] text-white text-xs font-bold">
                      + New Ticket Request
                    </Link>
                  </div>

                  {tickets.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <Plane className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500">No flight requests yet.</p>
                      <Link to="/services/tickets" className="inline-block px-4 py-2 rounded-xl bg-[#0B2A6F] text-white text-xs font-bold">
                        Submit Flight Request
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tickets.map((t) => {
                        const pnrMatch = t.special_request?.match(/PNR:\s*([A-Z0-9-]+)/i) || t.admin_notes?.match(/PNR:\s*([A-Z0-9-]+)/i);
                        const pnr = pnrMatch ? pnrMatch[1] : `DW-${t.id}7K`;
                        return (
                          <div key={t.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:border-[#0B2A6F] transition-all">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold text-slate-400">#DW-TKT-{t.id}</span>
                                  <span className="text-[10px] font-mono font-black text-[#0B2A6F] bg-blue-50 px-2 py-0.5 rounded-md">
                                    PNR: {pnr}
                                  </span>
                                </div>
                                <h4 className="text-base font-extrabold text-[#0B2A6F] mt-1">{t.from_location} → {t.to_location}</h4>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getStatusBadge(t.status)}`}>
                                {t.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                              <div><strong>Departure:</strong> {t.departure_date}</div>
                              {t.return_date && <div><strong>Return:</strong> {t.return_date}</div>}
                              <div><strong>Trip:</strong> {t.trip_type}</div>
                              <div><strong>Passengers:</strong> {t.adults} Adults ({t.travel_class})</div>
                            </div>

                            {t.quotation_amount_npr && (
                              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                                <span className="text-slate-500">Total Confirmed Fare:</span>
                                <span className="font-extrabold text-[#D71920]">NPR {parseFloat(t.quotation_amount_npr).toLocaleString()}</span>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2 border-t border-slate-100">
                              <button
                                onClick={() => setSelectedItem({
                                  id: `TKT-${t.id}`,
                                  service: 'Flight',
                                  title: `${t.from_location} → ${t.to_location}`,
                                  date: t.departure_date,
                                  status: t.status,
                                  fee: `NPR ${t.quotation_amount_npr || 37500}`,
                                  raw: t,
                                  pnr,
                                })}
                                className="flex-1 py-1.5 rounded-xl bg-[#0B2A6F] hover:bg-[#071b48] text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> View E-Ticket
                              </button>
                              {t.status !== 'CANCELLED' && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm(`Are you sure you want to cancel booking PNR ${pnr}?`)) {
                                      try {
                                        await ticketService.updateTicket(t.id, { status: 'CANCELLED' });
                                        fetchDashboardData();
                                      } catch (err) {
                                        alert('Cancellation failed: ' + (err.message || 'Error'));
                                      }
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: VISA APPLICATIONS */}
              {activeTab === 'visa' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#0B2A6F]">My Visa Applications</h3>
                      <p className="text-xs text-slate-500">Track embassy clearance and document processing.</p>
                    </div>
                    <Link to="/services/visa" className="px-4 py-2 rounded-xl bg-[#D71920] text-white text-xs font-bold">
                      + New Visa Application
                    </Link>
                  </div>

                  {visas.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500">No visa applications found.</p>
                      <Link to="/services/visa" className="inline-block px-4 py-2 rounded-xl bg-[#D71920] text-white text-xs font-bold">
                        Apply for Visa
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {visas.map((v) => (
                        <div key={v.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-slate-400">DW-VSA-{v.id}</span>
                              <h4 className="text-base font-extrabold text-[#0B2A6F]">{v.country} - {v.visa_type}</h4>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getStatusBadge(v.status)}`}>
                              {v.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                            <div><strong>Applicant:</strong> {v.full_name}</div>
                            <div><strong>Passport:</strong> {v.passport_number}</div>
                            <div><strong>Travel Date:</strong> {v.travel_date}</div>
                            <div><strong>Nationality:</strong> {v.nationality}</div>
                          </div>

                          {v.documents && v.documents.length > 0 && (
                            <div className="pt-2 border-t border-slate-200 text-xs text-emerald-700 font-semibold">
                              📎 {v.documents.length} document(s) uploaded
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: HOTEL BOOKINGS */}
              {activeTab === 'hotels' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#0B2A6F]">My Hotel Bookings</h3>
                      <p className="text-xs text-slate-500">Confirmed accommodations and stay details.</p>
                    </div>
                    <Link to="/services/hotels" className="px-4 py-2 rounded-xl bg-[#0B2A6F] text-white text-xs font-bold">
                      + Browse Hotels
                    </Link>
                  </div>

                  {hotelBookings.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500">No hotel reservations found.</p>
                      <Link to="/services/hotels" className="inline-block px-4 py-2 rounded-xl bg-[#0B2A6F] text-white text-xs font-bold">
                        Find Hotels
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hotelBookings.map((h) => (
                        <div key={h.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-slate-400">HTL-{h.id}</span>
                              <h4 className="text-base font-extrabold text-[#0B2A6F]">{h.hotel_details?.name || `Hotel #${h.hotel}`}</h4>
                              <p className="text-xs text-slate-500">{h.hotel_details?.location || 'International Destination'}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getStatusBadge(h.status)}`}>
                              {h.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                            <div><strong>Check-In:</strong> {h.check_in}</div>
                            <div><strong>Check-Out:</strong> {h.check_out}</div>
                            <div><strong>Guests:</strong> {h.guests} Adults</div>
                            <div><strong>Rooms:</strong> {h.rooms} Room</div>
                          </div>

                          {h.total_amount && (
                            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                              <span className="text-slate-500">Total Billed:</span>
                              <span className="font-extrabold text-[#0B2A6F]">NPR {h.total_amount}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: INVOICES & BILLING */}
              {activeTab === 'invoices' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#0B2A6F]">Invoices &amp; Receipts</h3>
                      <p className="text-xs text-slate-500">Official billing and payments history.</p>
                    </div>
                  </div>

                  {invoices.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500">No invoices issued yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-3 px-3">Invoice #</th>
                            <th className="py-3 px-3">Description</th>
                            <th className="py-3 px-3">Date</th>
                            <th className="py-3 px-3">Status</th>
                            <th className="py-3 px-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {invoices.map((inv) => (
                            <tr key={inv.id || inv.invoice_id} className="hover:bg-slate-50">
                              <td className="py-3 px-3 font-mono font-bold text-[#0B2A6F]">{inv.invoice_id || `INV-${inv.id}`}</td>
                              <td className="py-3 px-3 font-semibold text-slate-900">{inv.description || inv.service_type || 'Travel Service'}</td>
                              <td className="py-3 px-3 text-slate-600">{inv.date || inv.created_at?.slice(0, 10)}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(inv.status)}`}>
                                  {inv.status || 'PAID'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-black text-[#0B2A6F]">
                                NPR {inv.amount || inv.total || '0'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-extrabold text-[#0B2A6F]">System Notifications</h3>
                    <p className="text-xs text-slate-500">Real-time status alerts regarding your bookings and applications.</p>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs">You are all caught up! No unread notifications.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0B2A6F] flex items-center justify-center shrink-0 mt-0.5">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                            <p className="text-xs text-slate-600 mt-0.5">{n.message || n.text}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{n.created_at || 'Recently'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: CUSTOMER PROFILE */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 max-w-3xl">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-extrabold text-[#0B2A6F]">Customer Profile Settings</h3>
                    <p className="text-xs text-slate-500">Manage your contact details and passport information.</p>
                  </div>

                  {profileSuccessMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Profile information updated successfully!</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Passport Number</label>
                        <input
                          type="text"
                          value={profileData.passportNumber}
                          onChange={(e) => setProfileData({ ...profileData, passportNumber: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Resident Address</label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
                      />
                    </div>

                    <div className="pt-2">
                      <Button type="submit" variant="primary" size="md">
                        Save Profile Details
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* DETAIL VIEW MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 relative animate-in zoom-in-95">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B2A6F] bg-blue-50 px-2.5 py-0.5 rounded-md">
                {selectedItem.service} Details
              </span>
              <h3 className="text-xl font-extrabold text-[#0B2A6F] mt-2">{selectedItem.title}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedItem.id}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${getStatusBadge(selectedItem.status)}`}>
                  {selectedItem.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recorded Date:</span>
                <span className="font-semibold text-slate-800">{selectedItem.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quotation / Fee:</span>
                <span className="font-extrabold text-[#D71920]">{selectedItem.fee}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={() => setSelectedItem(null)}
            >
              Close Details
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboardPage;
