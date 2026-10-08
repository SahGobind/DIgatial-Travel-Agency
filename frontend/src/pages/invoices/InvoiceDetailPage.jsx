import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Phone, 
  MapPin, 
  Mail, 
  Globe, 
  ShieldCheck, 
  QrCode,
  Share2,
  AlertCircle
} from 'lucide-react';
import Container from '../../components/common/Container';
import { mockInvoices } from '../../data/invoices';

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Find the invoice or default to the first one if ID not matched
  const invoice = mockInvoices.find((inv) => inv.id === id) || mockInvoices[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    setDownloading(true);
    // Simulate PDF generation delay
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 1200);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> PAID IN FULL
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> PAYMENT PENDING
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5" /> CANCELLED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      <Container className="max-w-4xl">
        {/* Navigation & Action Bar (Hidden in Print) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            to="/invoices"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#0B2A6F] bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Invoices
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B2A6F] hover:bg-[#123D8D] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-75"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Preparing PDF...' : 'Download PDF'}
            </button>

            {invoice.status === 'Pending' && (
              <Link
                to={`/payments?invoice=${invoice.id}&amount=${invoice.balance}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#D71920] hover:bg-[#b01319] text-white text-sm font-bold rounded-xl shadow-xs transition-colors"
              >
                <CreditCard className="w-4 h-4" /> Pay NPR {invoice.balance.toLocaleString()}
              </Link>
            )}
          </div>
        </div>

        {/* Download notification toast */}
        {downloadSuccess && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>PDF preview prepared successfully. For instant hardcopy, use the <strong>Print Invoice</strong> button.</span>
            </div>
            <button onClick={() => setDownloadSuccess(false)} className="text-emerald-700 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Main Printable Invoice Paper */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none print:m-0">
          {/* Header Banner */}
          <div className="bg-linear-to-r from-[#0B2A6F] to-[#123D8D] text-white p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-blue-100 mb-2 border border-white/15">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-400" /> Gov. Regd. Travel & Overseas Agency
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                  DIGITAL WORLD TOUR & TRAVELS
                </h1>
                <p className="text-sm text-blue-100/90 mt-1">
                  Complete Flight Booking, Visa Processing, Hotel & Employment Solutions
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs uppercase tracking-widest text-blue-200 font-bold">Tax Invoice</div>
                <div className="text-2xl font-black font-mono mt-0.5 text-white">{invoice.invoiceNumber}</div>
                <div className="mt-2">{getStatusBadge(invoice.status)}</div>
              </div>
            </div>

            {/* Company Contact Details Strip */}
            <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-blue-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-white">Address:</span>
                  Thapa Chowk, Janakpur Dham, Nepal
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-white">Hotlines:</span>
                  9702022094, 9812193621
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-white">Email & Web:</span>
                  info@digitalworldtravel.com
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="p-8 sm:p-10 border-b border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Billed To */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/70">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Billed To (Customer)</span>
                <h3 className="text-lg font-bold text-slate-900">{invoice.customer.name}</h3>
                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{invoice.customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{invoice.customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{invoice.customer.address}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Specifics */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/70 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Invoice Information</span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Issue Date:</span>
                      <span className="font-bold text-slate-800">{invoice.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Due Date:</span>
                      <span className="font-bold text-slate-800">{invoice.dueDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Primary Service:</span>
                      <span className="font-bold text-[#0B2A6F]">{invoice.service}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Payment Method:</span>
                      <span className="font-bold text-slate-800">{invoice.paymentMethod || 'Pending'}</span>
                    </div>
                  </div>
                </div>

                {invoice.transactionId && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Txn Ref: <strong className="font-mono text-slate-700">{invoice.transactionId}</strong></span>
                    <span>Paid at: {invoice.paidAt}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="p-8 sm:p-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-xs font-black uppercase tracking-wider text-[#0B2A6F]">
                    <th className="py-3 px-3 w-12 text-center">#</th>
                    <th className="py-3 px-3">Service & Description</th>
                    <th className="py-3 px-3 text-center w-20">Qty</th>
                    <th className="py-3 px-3 text-right w-32">Unit Price (NPR)</th>
                    <th className="py-3 px-3 text-right w-36">Total (NPR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {invoice.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-3 text-center font-bold text-slate-400 text-xs">{index + 1}</td>
                      <td className="py-4 px-3">
                        <div className="font-bold text-slate-900">{item.service}</div>
                        <div className="text-xs text-slate-500 mt-0.5 max-w-lg">{item.description}</div>
                      </td>
                      <td className="py-4 px-3 text-center font-medium text-slate-700">{item.quantity}</td>
                      <td className="py-4 px-3 text-right font-medium text-slate-700">
                        {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="py-4 px-3 text-right font-bold text-slate-900">
                        {item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Summary & Financial Breakdown */}
            <div className="mt-8 pt-6 border-t-2 border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Terms & Payment Notes */}
              <div className="text-xs text-slate-500 space-y-2.5">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Terms & Conditions:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>Air tickets are subject to airline fare rules, cancellation & rescheduling penalties.</li>
                  <li>Visa fees are non-refundable once the official embassy submission has commenced.</li>
                  <li>Please retain this official receipt for boarding clearance and visa collection.</li>
                </ul>

                <div className="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-3">
                  <QrCode className="w-10 h-10 text-[#0B2A6F] shrink-0" />
                  <div className="text-[11px] text-slate-600">
                    <span className="font-bold text-[#0B2A6F] block">Digital Verification QR</span>
                    Scan with any smartphone camera to verify authentic agency issue status.
                  </div>
                </div>
              </div>

              {/* Totals Table */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">NPR {invoice.subtotal.toLocaleString()}</span>
                </div>

                {invoice.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-700">
                    <span>Promotional Discount:</span>
                    <span className="font-semibold">- NPR {invoice.discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-slate-600">
                  <span>Government Tax / VAT (13%):</span>
                  <span className="font-semibold text-slate-800">NPR {invoice.tax.toLocaleString()}</span>
                </div>

                <div className="pt-3 border-t-2 border-slate-300 flex justify-between items-baseline">
                  <span className="text-base font-black text-slate-900 uppercase">Total Amount:</span>
                  <span className="text-2xl font-black text-[#0B2A6F]">NPR {invoice.total.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm text-slate-700 pt-1">
                  <span>Amount Paid:</span>
                  <span className="font-bold text-emerald-600">NPR {invoice.paid.toLocaleString()}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800 uppercase">Balance Due:</span>
                  <span className={`text-lg font-black ${invoice.balance > 0 ? 'text-[#D71920]' : 'text-emerald-700'}`}>
                    NPR {invoice.balance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Official Signature & Stamp Area */}
            <div className="mt-12 pt-8 border-t border-dashed border-slate-300 grid grid-cols-2 gap-8 items-end text-center">
              <div>
                <div className="h-14 flex items-center justify-center">
                  <span className="text-xs italic text-slate-400 font-serif">Customer Signature / Acknowledgment</span>
                </div>
                <div className="border-t border-slate-400 max-w-[200px] mx-auto pt-1 text-xs font-semibold text-slate-600">
                  Received by Customer
                </div>
              </div>

              <div>
                <div className="h-14 flex items-center justify-center">
                  <div className="w-24 h-12 rounded-full border-2 border-[#0B2A6F]/40 flex items-center justify-center rotate-[-6deg] text-[10px] font-black text-[#0B2A6F]/60 uppercase tracking-widest">
                    OFFICIAL SEAL
                  </div>
                </div>
                <div className="border-t border-slate-400 max-w-[200px] mx-auto pt-1 text-xs font-bold text-[#0B2A6F]">
                  For: Digital World Tour & Travels
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default InvoiceDetailPage;
