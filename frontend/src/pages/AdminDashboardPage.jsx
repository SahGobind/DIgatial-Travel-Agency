import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Plane, 
  FileCheck, 
  Building2, 
  Briefcase, 
  Receipt, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  Globe, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter, 
  Bell, 
  ShieldCheck, 
  ChevronRight,
  Loader2,
  RefreshCw,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  Home
} from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { 
  ticketService, 
  visaService, 
  hotelService, 
  customerService, 
  invoiceService 
} from '../services';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestFilter, setRequestFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Live Database States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [visas, setVisas] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Fetch all administrative records from backend
  const fetchAdminData = async () => {
    try {
      setRefreshing(true);
      const [
        ticketsRes,
        visasRes,
        hotelsBookingsRes,
        customersRes,
        hotelsRes,
        invoicesRes,
      ] = await Promise.allSettled([
        ticketService.getTickets(),
        visaService.getVisas(),
        hotelService.getBookings(),
        customerService.getCustomers(),
        hotelService.getHotels(),
        invoiceService.getInvoices(),
      ]);

      if (ticketsRes.status === 'fulfilled') setTickets(ticketsRes.value || []);
      if (visasRes.status === 'fulfilled') setVisas(visasRes.value || []);
      if (hotelsBookingsRes.status === 'fulfilled') setHotelBookings(hotelsBookingsRes.value || []);
      if (customersRes.status === 'fulfilled') setCustomers(customersRes.value || []);
      if (hotelsRes.status === 'fulfilled') setHotels(hotelsRes.value || []);
      if (invoicesRes.status === 'fulfilled') setInvoices(invoicesRes.value || []);
    } catch (err) {
      console.warn('Admin dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Aggregate all service requests for centralized admin processing
  const allRequests = [
    ...tickets.map((t) => ({
      id: `TKT-${t.id}`,
      rawId: t.id,
      service: 'Ticket',
      customer: t.customer_details?.full_name || t.customer_details?.email || 'Customer',
      email: t.customer_details?.email || '',
      phone: t.customer_details?.phone || '',
      serviceType: `Flight ${t.from_location} → ${t.to_location}`,
      destination: t.to_location,
      date: t.departure_date || t.created_at?.slice(0, 10),
      status: t.status || 'PENDING',
      amount: t.quotation_amount_npr ? `NPR ${t.quotation_amount_npr}` : 'Quote Required',
      raw: t,
    })),
    ...visas.map((v) => ({
      id: `VSA-${v.id}`,
      rawId: v.id,
      service: 'Visa',
      customer: v.full_name || v.customer_details?.full_name || 'Applicant',
      email: v.email || v.customer_details?.email || '',
      phone: v.phone || v.customer_details?.phone || '',
      serviceType: `${v.country} (${v.visa_type})`,
      destination: v.country,
      date: v.travel_date || v.created_at?.slice(0, 10),
      status: v.status || 'SUBMITTED',
      amount: v.government_fee_npr ? `NPR ${v.government_fee_npr}` : 'NPR 15,000',
      raw: v,
    })),
    ...hotelBookings.map((h) => ({
      id: `HTL-${h.id}`,
      rawId: h.id,
      service: 'Hotel',
      customer: h.customer_details?.full_name || h.customer_details?.email || 'Guest',
      email: h.customer_details?.email || '',
      phone: h.customer_details?.phone || '',
      serviceType: h.hotel_details?.name || `Hotel Reservation #${h.id}`,
      destination: h.hotel_details?.location || 'International',
      date: h.check_in || h.created_at?.slice(0, 10),
      status: h.status || 'CONFIRMED',
      amount: h.total_amount ? `NPR ${h.total_amount}` : 'NPR 25,000',
      raw: h,
    })),
  ].sort((a, b) => (b.date > a.date ? 1 : -1));

  // Status Updater Handler (Real DRF PATCH)
  const handleUpdateStatus = async (item, newStatus) => {
    try {
      setUpdatingId(item.id);
      if (item.service === 'Ticket') {
        await ticketService.updateTicket(item.rawId, { status: newStatus });
      } else if (item.service === 'Visa') {
        await visaService.updateVisa(item.rawId, { status: newStatus });
      } else if (item.service === 'Hotel') {
        await hotelService.updateBooking(item.rawId, { status: newStatus });
      }

      await fetchAdminData();
      if (selectedRequest && selectedRequest.id === item.id) {
        setSelectedRequest((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to update record status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter requests
  const filteredRequests = allRequests.filter((req) => {
    const matchesFilter = requestFilter === 'All' || req.service === requestFilter;
    const matchesSearch = 
      req.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('CONFIRM') || s.includes('APPROVED') || s.includes('COMPLETED') || s.includes('ACTIVE')) {
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

  const sidebarLinks = [
    { id: 'dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { id: 'requests', label: 'All Customer Inquiries', icon: FileCheck, count: allRequests.length },
    { id: 'tickets', label: 'Flight Tickets Desk', icon: Plane, count: tickets.length },
    { id: 'visa', label: 'Visa Applications Desk', icon: ShieldCheck, count: visas.length },
    { id: 'hotels', label: 'Hotels & Bookings', icon: Building2, count: hotelBookings.length },
    { id: 'customers', label: 'Customer Accounts', icon: Users, count: customers.length },
    { id: 'invoices', label: 'Billing & Invoices', icon: Receipt, count: invoices.length },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col lg:flex-row text-[#172033]">
      {/* 1. ADMIN SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D71920] flex items-center justify-center text-white shadow-md">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-white leading-tight">
                  DIGITAL WORLD
                </span>
                <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                  Admin Central Desk
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Profile Brief */}
          <div className="p-4 mx-4 my-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-sm shadow">
              AD
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || 'Super Administrator'}
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold block truncate">
                Full Database Access
              </span>
            </div>
          </div>

          {/* Navigation Links */}
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
                      ? 'bg-[#D71920] text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-white text-[#D71920]' : 'bg-slate-800 text-slate-300'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. ADMIN MAIN VIEW */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Top Header */}
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
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-[#D71920] text-xs font-bold transition cursor-pointer"
              title="Go back to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <Link
              to="/"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-[#D71920] text-xs font-bold transition"
              title="Return to main website"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Website</span>
            </Link>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 capitalize">
              {activeTab === 'dashboard' ? 'Administrative Operations Dashboard' : activeTab.replace(/([A-Z])/g, ' $1')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Refresh */}
            <button
              type="button"
              onClick={fetchAdminData}
              disabled={refreshing}
              title="Refresh Live Data"
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#0B2A6F] hover:bg-blue-50 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#0B2A6F]' : ''}`} />
            </button>

            {/* Admin Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Django REST API</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-8 flex-1 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-[#0B2A6F] mb-4" />
              <p className="text-sm font-bold text-slate-600">Syncing with Backend Database...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW METRICS */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* Real Counts Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div 
                      onClick={() => setActiveTab('requests')}
                      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Total Inquiries</span>
                        <FileCheck className="w-5 h-5 text-[#0B2A6F]" />
                      </div>
                      <div className="text-3xl font-black text-[#0B2A6F]">{allRequests.length}</div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Cross-service customer requests</span>
                    </div>

                    <div 
                      onClick={() => setActiveTab('tickets')}
                      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Flight Tickets</span>
                        <Plane className="w-5 h-5 text-[#D71920]" />
                      </div>
                      <div className="text-3xl font-black text-[#D71920]">{tickets.length}</div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Flight ticketing database</span>
                    </div>

                    <div 
                      onClick={() => setActiveTab('visa')}
                      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Visa Files</span>
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="text-3xl font-black text-emerald-700">{visas.length}</div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Embassy visa applications</span>
                    </div>

                    <div 
                      onClick={() => setActiveTab('customers')}
                      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Registered Users</span>
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-3xl font-black text-purple-700">{customers.length || '3+'}</div>
                      <span className="text-[11px] text-slate-500 mt-1 block">Verified client accounts</span>
                    </div>
                  </div>

                  {/* Central Inquiries Processing Desk */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Customer Inquiries &amp; Lifecycle Management</h3>
                        <p className="text-xs text-slate-500">Live database queue. Click status to update backend records directly.</p>
                      </div>

                      {/* Filter & Search */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search customer, ID, destination..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:border-[#0B2A6F]"
                          />
                        </div>

                        <select
                          value={requestFilter}
                          onChange={(e) => setRequestFilter(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700 focus:outline-none"
                        >
                          <option value="All">All Services</option>
                          <option value="Ticket">Flight Tickets</option>
                          <option value="Visa">Visa Applications</option>
                          <option value="Hotel">Hotel Bookings</option>
                          <option value="Employment">Foreign Employment</option>
                        </select>
                      </div>
                    </div>

                    {/* Inquiries Table */}
                    {filteredRequests.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        No service requests match the selected search criteria.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                              <th className="py-3 px-3">Ref ID</th>
                              <th className="py-3 px-3">Customer</th>
                              <th className="py-3 px-3">Service</th>
                              <th className="py-3 px-3">Details / Route</th>
                              <th className="py-3 px-3">Date</th>
                              <th className="py-3 px-3">Status</th>
                              <th className="py-3 px-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredRequests.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-3 font-mono font-bold text-[#0B2A6F]">{item.id}</td>
                                <td className="py-3 px-3">
                                  <div className="font-bold text-slate-900">{item.customer}</div>
                                  <span className="text-[10px] text-slate-400">{item.phone || item.email}</span>
                                </td>
                                <td className="py-3 px-3 font-semibold text-slate-700">{item.service}</td>
                                <td className="py-3 px-3 font-medium text-slate-800">{item.serviceType}</td>
                                <td className="py-3 px-3 text-slate-500">{item.date}</td>
                                <td className="py-3 px-3">
                                  <select
                                    value={item.status}
                                    disabled={updatingId === item.id}
                                    onChange={(e) => handleUpdateStatus(item, e.target.value)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border focus:outline-none cursor-pointer ${getStatusBadge(item.status)}`}
                                  >
                                    <option value="PENDING">PENDING</option>
                                    <option value="PROCESSING">PROCESSING</option>
                                    <option value="QUOTATION_SENT">QUOTATION_SENT</option>
                                    <option value="CONFIRMED">CONFIRMED</option>
                                    <option value="APPROVED">APPROVED</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                  </select>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedRequest(item)}
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

              {/* TAB 2: REQUESTS TAB */}
              {activeTab === 'requests' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-xl font-extrabold text-[#0B2A6F]">All Customer Requests &amp; Inquiries</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-3 px-3">Ref ID</th>
                          <th className="py-3 px-3">Customer</th>
                          <th className="py-3 px-3">Service</th>
                          <th className="py-3 px-3">Details</th>
                          <th className="py-3 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allRequests.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-mono font-bold text-[#0B2A6F]">{item.id}</td>
                            <td className="py-3 px-3 font-bold text-slate-900">{item.customer}</td>
                            <td className="py-3 px-3 font-semibold text-slate-700">{item.service}</td>
                            <td className="py-3 px-3 text-slate-800">{item.serviceType}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getStatusBadge(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOMERS */}
              {activeTab === 'customers' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-xl font-extrabold text-[#0B2A6F]">Registered Customer Accounts</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-3 px-3">ID</th>
                          <th className="py-3 px-3">Name</th>
                          <th className="py-3 px-3">Email</th>
                          <th className="py-3 px-3">Phone</th>
                          <th className="py-3 px-3">Role</th>
                          <th className="py-3 px-3">Active</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customers.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-mono font-bold text-[#0B2A6F]">CUST-{c.id}</td>
                            <td className="py-3 px-3 font-bold text-slate-900">{c.full_name || c.name || 'Customer'}</td>
                            <td className="py-3 px-3 text-slate-600">{c.email}</td>
                            <td className="py-3 px-3 text-slate-600">{c.phone || '-'}</td>
                            <td className="py-3 px-3 font-bold text-[#0B2A6F]">{c.role || 'CUSTOMER'}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: FLIGHTS */}
              {activeTab === 'tickets' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-xl font-extrabold text-[#0B2A6F]">Flight Tickets Database Desk</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tickets.map((t) => (
                      <div key={t.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-mono font-bold text-[#0B2A6F]">DW-TKT-{t.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(t.status)}`}>{t.status}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{t.from_location} → {t.to_location}</h4>
                        <p className="text-slate-500">Departure: {t.departure_date} • {t.trip_type} • {t.adults} Adults</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: VISA */}
              {activeTab === 'visa' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-xl font-extrabold text-[#0B2A6F]">Visa Applications Desk</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visas.map((v) => (
                      <div key={v.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-mono font-bold text-[#0B2A6F]">DW-VSA-{v.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(v.status)}`}>{v.status}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{v.full_name} - {v.country}</h4>
                        <p className="text-slate-500">Passport: {v.passport_number} • Travel Date: {v.travel_date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: HOTELS */}
              {activeTab === 'hotels' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-xl font-extrabold text-[#0B2A6F]">Hotel Inventory &amp; Bookings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotelBookings.map((h) => (
                      <div key={h.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-mono font-bold text-[#0B2A6F]">HTL-{h.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(h.status)}`}>{h.status}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{h.hotel_details?.name || `Hotel #${h.hotel}`}</h4>
                        <p className="text-slate-500">Dates: {h.check_in} to {h.check_out} • {h.guests} Guests</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: INVOICES */}
              {activeTab === 'invoices' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-xl font-extrabold text-[#0B2A6F]">Customer Invoices</h3>
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
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ADMIN DETAIL MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 relative animate-in zoom-in-95">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B2A6F] bg-blue-50 px-2.5 py-0.5 rounded-md">
                {selectedRequest.service} Request Details
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">{selectedRequest.serviceType}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedRequest.id}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-slate-900">{selectedRequest.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contact:</span>
                <span className="font-semibold text-slate-800">{selectedRequest.phone || selectedRequest.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-semibold text-slate-800">{selectedRequest.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${getStatusBadge(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={() => setSelectedRequest(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
