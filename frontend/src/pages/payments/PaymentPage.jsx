import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Banknote, 
  Landmark, 
  QrCode, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  Copy, 
  Check, 
  Lock, 
  FileText, 
  Phone, 
  MapPin, 
  Receipt,
  Download,
  Info
} from 'lucide-react';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import { mockInvoices } from '../../data/invoices';
import { useLanguage } from '../../context/LanguageContext';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const invoiceParam = searchParams.get('invoice');
  const amountParam = searchParams.get('amount');

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoiceParam || 'DW-2026-00125');
  const [activeMethod, setActiveMethod] = useState('online'); // 'online', 'card', 'bank_transfer', 'cash'
  const [copiedField, setCopiedField] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [showSecurityBanner, setShowSecurityBanner] = useState(true);

  // Card Form State
  const [cardData, setCardData] = useState({
    name: 'Sonu Kumar Sah',
    number: '4111 2222 3333 4444',
    expiry: '12/28',
    cvv: '123'
  });

  // Online Wallet Form State
  const [walletData, setWalletData] = useState({
    walletProvider: 'esewa', // 'esewa', 'khalti', 'fonepay'
    mobileNumber: '9812193621',
    mpin: '••••'
  });

  // Bank Transfer Form State
  const [bankData, setBankData] = useState({
    senderBank: 'Nepal Investment Mega Bank',
    txnRef: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
    slipUploaded: false
  });

  const currentInvoice = mockInvoices.find((i) => i.id === selectedInvoiceId) || mockInvoices[1];
  const payableAmount = amountParam ? Number(amountParam) : (currentInvoice?.balance || currentInvoice?.total || 50000);

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate API processing delay
    setTimeout(() => {
      setIsProcessing(false);
      const receipt = {
        receiptNumber: 'RCP-' + Math.floor(100000 + Math.random() * 900000),
        invoiceNumber: currentInvoice.invoiceNumber,
        customerName: currentInvoice.customer.name,
        service: currentInvoice.service,
        amount: payableAmount,
        paymentMethod: 
          activeMethod === 'online' ? `Online Wallet (${walletData.walletProvider.toUpperCase()})` :
          activeMethod === 'card' ? 'Card (Visa ending in 4444)' :
          activeMethod === 'bank_transfer' ? `Bank Wire (${bankData.senderBank})` : 'Cash at Janakpur Branch Counter',
        transactionId: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        date: new Date().toLocaleString(),
        status: 'Success'
      };
      setPaymentReceipt(receipt);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      <PageHeader
        title="Secure Payment Portal"
        subtitle="Complete payments for flight tickets, visa processing, tour packages, and hotel reservations"
        breadcrumbs={[
          { label: 'Home', link: '/' },
          { label: 'Invoices', link: '/invoices' },
          { label: 'Payment' }
        ]}
      />

      <Container className="mt-8">
        {/* Official Nepal SSL Secure Payment Notice */}
        {showSecurityBanner && (
          <div className="mb-8 p-4 bg-blue-50/80 border border-blue-200/90 rounded-2xl flex items-start justify-between gap-3.5 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#0B2A6F] shrink-0 mt-0.5" />
              <div className="text-xs text-blue-950 leading-relaxed">
                <strong className="font-bold">
                  {language === 'ne' ? '२५६-बिट सुरक्षित भुक्तानी पोर्टल:' : '256-bit SSL Encrypted Payment Portal:'}
                </strong>{' '}
                {language === 'ne'
                  ? 'डिजिटल वर्ल्ड टुर एण्ड ट्राभल्सको आधिकारिक गेटवे। इ-सेवा, खल्ती र फोनपे क्युआर कोड स्क्यान गरी तुरुन्तै रसिद प्राप्त गर्नुहोस्। जनकपुर काउन्टरमा नगद भुक्तानी पनि मान्य छ।'
                  : 'Official gateway for Digital World Tour & Travels. Instant payment verification for eSewa, Khalti, Fonepay QR, and Bank Wire with digital receipt issuance.'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSecurityBanner(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-blue-100/50 transition-colors shrink-0 text-sm font-bold"
              title="Close notice"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Payment Methods & Forms (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Method Tabs */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActiveMethod('online')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  activeMethod === 'online'
                    ? 'border-[#0B2A6F] bg-blue-50/70 text-[#0B2A6F] shadow-xs'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1 text-[#0B2A6F]" />
                <span className="text-xs font-bold">Online / QR</span>
                <span className="text-[10px] text-slate-400">eSewa • Khalti • Fonepay</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  activeMethod === 'card'
                    ? 'border-[#0B2A6F] bg-blue-50/70 text-[#0B2A6F] shadow-xs'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1 text-[#0B2A6F]" />
                <span className="text-xs font-bold">Card</span>
                <span className="text-[10px] text-slate-400">Visa • Master • Union</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('bank_transfer')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  activeMethod === 'bank_transfer'
                    ? 'border-[#0B2A6F] bg-blue-50/70 text-[#0B2A6F] shadow-xs'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Landmark className="w-5 h-5 mb-1 text-[#0B2A6F]" />
                <span className="text-xs font-bold">Bank Transfer</span>
                <span className="text-[10px] text-slate-400">NIMB • NIC • Global</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('cash')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  activeMethod === 'cash'
                    ? 'border-[#0B2A6F] bg-blue-50/70 text-[#0B2A6F] shadow-xs'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1 text-[#0B2A6F]" />
                <span className="text-xs font-bold">Cash</span>
                <span className="text-[10px] text-slate-400">Branch Counter</span>
              </button>
            </div>

            {/* Method Details Panel */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <form onSubmit={handleProcessPayment}>
                {/* 1. ONLINE WALLET / QR PAYMENT */}
                {activeMethod === 'online' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Instant Wallet / Fonepay QR</h3>
                        <p className="text-xs text-slate-500">Scan QR using your mobile banking app or enter eSewa/Khalti ID</p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
                        Zero Gateway Surcharge
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                      {/* Simulated QR Code */}
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center">
                        <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 inline-block mb-3">
                          {/* Stylized QR Box */}
                          <div className="w-36 h-36 bg-slate-900 rounded-lg p-2 flex flex-col items-center justify-between text-white">
                            <div className="flex justify-between w-full">
                              <div className="w-8 h-8 border-4 border-white rounded-md flex items-center justify-center">
                                <div className="w-3 h-3 bg-white" />
                              </div>
                              <div className="w-8 h-8 border-4 border-white rounded-md flex items-center justify-center">
                                <div className="w-3 h-3 bg-white" />
                              </div>
                            </div>
                            <div className="text-[9px] font-mono tracking-widest text-emerald-400 font-black">FONEPAY • SCAN</div>
                            <div className="flex justify-between w-full">
                              <div className="w-8 h-8 border-4 border-white rounded-md flex items-center justify-center">
                                <div className="w-3 h-3 bg-white" />
                              </div>
                              <div className="w-6 h-6 border-2 border-dashed border-red-400 flex items-center justify-center text-[8px] font-bold">
                                DW
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#0B2A6F]">Digital World Tour & Travels</span>
                        <span className="text-[11px] text-slate-500">Merchant Code: DWTT-JKP-2026</span>
                      </div>

                      {/* Wallet ID Input */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Digital Wallet</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['esewa', 'khalti', 'fonepay'].map((provider) => (
                              <button
                                key={provider}
                                type="button"
                                onClick={() => setWalletData({ ...walletData, walletProvider: provider })}
                                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center uppercase tracking-wider transition-all ${
                                  walletData.walletProvider === provider
                                    ? 'bg-[#0B2A6F] text-white border-[#0B2A6F]'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {provider}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Registered Mobile / Wallet ID</label>
                          <input
                            type="text"
                            value={walletData.mobileNumber}
                            onChange={(e) => setWalletData({ ...walletData, mobileNumber: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0B2A6F]"
                            placeholder="e.g. 9812193621"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Security MPIN / OTP (Demo: 1234)</label>
                          <input
                            type="password"
                            maxLength={6}
                            value={walletData.mpin}
                            onChange={(e) => setWalletData({ ...walletData, mpin: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:border-[#0B2A6F]"
                            placeholder="••••"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CREDIT / DEBIT CARD */}
                {activeMethod === 'card' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Credit / Debit Card</h3>
                        <p className="text-xs text-slate-500">256-bit encrypted card processing demonstration</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" /> 3D Secure
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardData.name}
                          onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0B2A6F]"
                          placeholder="Name as printed on card"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardData.number}
                            onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#0B2A6F]"
                            placeholder="4111 2222 3333 4444"
                            maxLength={19}
                            required
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <span className="text-[10px] font-black px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">VISA</span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 bg-red-100 text-red-800 rounded">MC</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Expiry Date (MM/YY)</label>
                          <input
                            type="text"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#0B2A6F]"
                            placeholder="12/28"
                            maxLength={5}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">CVV / CVC (Demo)</label>
                          <input
                            type="password"
                            value={cardData.cvv}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#0B2A6F]"
                            placeholder="123"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. BANK TRANSFER */}
                {activeMethod === 'bank_transfer' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Direct Bank Wire Transfer</h3>
                        <p className="text-xs text-slate-500">Transfer funds to our official corporate bank accounts</p>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">NEFT / RTGS / IPS</span>
                    </div>

                    <div className="space-y-3">
                      {/* Bank 1 */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-[#0B2A6F] block">Nepal Investment Mega Bank (NIMB)</span>
                            <span className="text-[11px] text-slate-500">A/C Name: DIGITAL WORLD TOUR & TRAVELS PVT. LTD.</span>
                            <div className="mt-1 font-mono font-bold text-sm text-slate-800">
                              0140 1020 0349 9210
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Branch: Janakpur Dham | SWIFT: NIMBNPKA</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('0140102003499210', 'nimb')}
                            className="p-2 text-slate-500 hover:text-[#0B2A6F] hover:bg-white rounded-lg border border-slate-200 transition-colors"
                            title="Copy Account Number"
                          >
                            {copiedField === 'nimb' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Bank 2 */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-[#0B2A6F] block">NIC Asia Bank</span>
                            <span className="text-[11px] text-slate-500">A/C Name: DIGITAL WORLD TOUR & TRAVELS PVT. LTD.</span>
                            <div className="mt-1 font-mono font-bold text-sm text-slate-800">
                              2940 5500 1289 4401
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Branch: Bhanu Chowk, Janakpur | SWIFT: NICAAPKA</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('2940550012894401', 'nica')}
                            className="p-2 text-slate-500 hover:text-[#0B2A6F] hover:bg-white rounded-lg border border-slate-200 transition-colors"
                            title="Copy Account Number"
                          >
                            {copiedField === 'nica' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Your Deposit / Transaction Reference ID</label>
                      <input
                        type="text"
                        value={bankData.txnRef}
                        onChange={(e) => setBankData({ ...bankData, txnRef: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#0B2A6F]"
                        placeholder="e.g. TXN-892140"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* 4. CASH PAYMENT AT COUNTER */}
                {activeMethod === 'cash' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Pay Cash at Janakpur Main Counter</h3>
                        <p className="text-xs text-slate-500">Visit our office counter for physical cash receipt and stamp verification</p>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-50 text-[#0B2A6F] text-xs font-bold rounded-lg border border-blue-200">
                        Counter Service
                      </span>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-700">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-slate-900">Branch Address:</strong>
                          Thapa Chowk, Janakpur Dham, Dhanusha, Nepal
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Phone className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-slate-900">Counter Telephone:</strong>
                          9702022094 / 9812193621 (Sun - Fri: 9:00 AM - 6:00 PM)
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-[#0B2A6F] shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-slate-900">Counter Protocol:</strong>
                          Present your Invoice Number <span className="font-mono font-bold text-[#0B2A6F]">{currentInvoice.invoiceNumber}</span> to the billing officer to receive a physical stamped receipt.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/invoices/${currentInvoice.id}`}
                    className="text-xs font-semibold text-slate-500 hover:text-[#0B2A6F] flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Review Full Invoice
                  </Link>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-6 py-3 bg-[#D71920] hover:bg-[#b01319] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-75 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Authorizing Demo Payment...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Confirm Payment (NPR {payableAmount.toLocaleString()})
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Invoice Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Invoice Selector / Summary Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">Target Invoice</span>

              {/* Invoice Picker */}
              <div className="mb-4">
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B2A6F]"
                >
                  {mockInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.customer.name} (NPR {inv.total.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900">{currentInvoice.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-[#0B2A6F]">{currentInvoice.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Total:</span>
                  <span className="font-bold text-slate-900">NPR {currentInvoice.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Already Paid:</span>
                  <span className="font-semibold text-emerald-600">NPR {currentInvoice.paid.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                  <span className="text-slate-800">Payable Now:</span>
                  <span className="text-[#D71920]">NPR {payableAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Agency Guarantee */}
              <div className="space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Verified Agency Billing
                </div>
                <p>Instant official receipt issued upon payment. Keep for ticket and visa handover.</p>
              </div>
            </div>

            {/* Support Info */}
            <div className="bg-linear-to-br from-[#0B2A6F] to-[#123D8D] text-white p-6 rounded-3xl shadow-sm">
              <h4 className="font-bold text-sm mb-1">Need Billing Support?</h4>
              <p className="text-xs text-blue-100 mb-4">Our Janakpur Dham accounts department is active to assist you.</p>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-red-400" />
                  <span>+977 9702022094</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-red-400" />
                  <span>+977 9812193621</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Payment Confirmation Receipt Modal */}
      {paymentReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-scale-up">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Payment Successful!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Transaction processed successfully (Demo Confirmation).
              </p>
            </div>

            {/* Receipt Details Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt Number:</span>
                <span className="font-bold font-mono text-slate-900">{paymentReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="font-bold font-mono text-[#0B2A6F]">{paymentReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-900">{paymentReceipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-700">{paymentReceipt.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-semibold text-slate-900">{paymentReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono text-slate-700">{paymentReceipt.transactionId}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                <span className="text-slate-800">Amount Paid:</span>
                <span className="text-emerald-600">NPR {paymentReceipt.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <Link
                to={`/invoices/${currentInvoice.id}`}
                className="w-full py-2.5 bg-[#0B2A6F] hover:bg-[#123D8D] text-white text-xs font-bold rounded-xl text-center shadow-xs transition-colors"
              >
                View Updated Invoice
              </Link>
              <button
                onClick={() => setPaymentReceipt(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
