import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Download,
  AlertCircle
} from 'lucide-react';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import { mockInvoices } from '../../data/invoices';

const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Filter logic
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = selectedStatus === 'All' || inv.status === selectedStatus;
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate summary metrics
  const totalAmount = invoices.reduce((acc, curr) => acc + curr.total, 0);
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.paid, 0);
  const totalPending = invoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.balance, 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Paid
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Pending
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <PageHeader 
        title="Invoices & Billing" 
        subtitle="Manage customer invoices, track payment statuses, and review financial statements"
        breadcrumbs={[
          { label: 'Home', link: '/' },
          { label: 'Invoices' }
        ]}
      />

      <Container className="mt-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Billed</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B2A6F] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">NPR {totalAmount.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-medium text-slate-700">{invoices.length}</span> total invoices generated
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Collected</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600">NPR {totalPaid.toLocaleString()}</div>
            <div className="text-xs text-emerald-600/80 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Fully received
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Receivables</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600">NPR {totalPending.toLocaleString()}</div>
            <div className="text-xs text-amber-600/80 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Awaiting payment
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payment Gateway</span>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-[#D71920] flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">Online / Cash</div>
            <Link 
              to="/payments" 
              className="text-xs font-semibold text-[#D71920] hover:underline mt-1 inline-flex items-center gap-1"
            >
              Open Payment Portal <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search invoice, customer, service..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0B2A6F] focus:bg-white transition-all"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-full sm:w-auto overflow-x-auto">
              {['All', 'Paid', 'Pending', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    selectedStatus === status
                      ? 'bg-white text-[#0B2A6F] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {status} {status === 'All' ? `(${invoices.length})` : `(${invoices.filter(i => i.status === status).length})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Invoice Number</th>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Amount</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold">No invoices found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search query or status filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr 
                      key={invoice.id} 
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="py-4 px-5">
                        <Link 
                          to={`/invoices/${invoice.id}`}
                          className="font-bold text-[#0B2A6F] hover:text-[#D71920] flex items-center gap-1.5 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#D71920]" />
                          {invoice.invoiceNumber}
                        </Link>
                        <span className="text-[11px] text-slate-400 block mt-0.5">{invoice.service}</span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-900">{invoice.customer.name}</div>
                        <div className="text-xs text-slate-500">{invoice.customer.phone}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-slate-700 font-medium">{invoice.date}</div>
                        <div className="text-[11px] text-slate-400">Due: {invoice.dueDate}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">NPR {invoice.total.toLocaleString()}</div>
                        {invoice.balance > 0 && (
                          <div className="text-[11px] font-semibold text-amber-600">Bal: NPR {invoice.balance.toLocaleString()}</div>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/invoices/${invoice.id}`}
                            className="p-1.5 text-slate-600 hover:text-[#0B2A6F] hover:bg-slate-100 rounded-lg transition-colors title='View Invoice'"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/invoices/${invoice.id}`}
                            className="p-1.5 text-slate-600 hover:text-[#0B2A6F] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Print Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </Link>
                          {invoice.status === 'Pending' && (
                            <Link
                              to={`/payments?invoice=${invoice.id}&amount=${invoice.balance}`}
                              className="px-3 py-1 bg-[#D71920] hover:bg-[#b01319] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pay
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default InvoiceListPage;
