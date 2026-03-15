import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, User, ChevronDown, Globe, MapPin } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { api } from '../services/api';
import type { Contact } from './ContactsPage';

// ── Supported International Currencies ─────────────────────────
const CURRENCIES = ['NAD', 'USD', 'EUR', 'GBP', 'ZAR', 'BWP'];

// ── Helper: format number to 2 dp ──────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString('en-NA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Zod schemas ────────────────────────────────────────────────
const localSchema = z.object({
  senderAccountNumber: z.string().min(10).regex(/^\d+$/),
  receiverAccountNumber: z.string().min(10, 'Must be at least 10 digits').regex(/^\d+$/, 'Must contain only digits'),
  amount: z.number({ message: 'Amount is required' }).positive('Must be greater than zero'),
  currency: z.literal('NAD'),
  reference: z.string().min(1, 'Reference is required').max(50, 'Maximum 50 characters'),
});

const internationalSchema = z.object({
  senderAccountNumber: z.string().min(10).regex(/^\d+$/),
  receiverAccountNumber: z.string().min(10, 'Must be at least 10 digits').regex(/^\d+$/, 'Must contain only digits'),
  amount: z.number({ message: 'Amount is required' }).positive('Must be greater than zero'),
  currency: z.enum(['NAD', 'USD', 'EUR', 'GBP', 'ZAR', 'BWP'] as const),
  reference: z.string().min(1, 'Reference is required').max(50, 'Maximum 50 characters'),
});

type LocalForm = z.infer<typeof localSchema>;
type InternationalForm = z.infer<typeof internationalSchema>;
type PaymentFormValues = LocalForm | InternationalForm;

// ── Component ──────────────────────────────────────────────────
export function SendMoneyPage() {
  const location = useLocation();
  const [paymentType, setPaymentType] = useState<'local' | 'international'>('local');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResponse, setSuccessResponse] = useState<any>(null);
  const [errorResponse, setErrorResponse] = useState<any>(null);
  const [showContacts, setShowContacts] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [availableRates, setAvailableRates] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [contactsData, ratesData] = await Promise.all([
          api.getContacts(),
          api.getRates()
        ]);
        setContacts(contactsData);
        setAvailableRates(ratesData);

        // Handle navigation pre-fill from Contacts page
        const state = location.state as { prefillAccount?: string, isInternational?: boolean };
        if (state?.prefillAccount && contactsData.length > 0) {
          // Temporarily set payment type first to force schema switch
          const isIntl = state.isInternational === true;
          setPaymentType(isIntl ? 'international' : 'local');
          
          // Use timeout to allow React Hook Form schema to switch before setting values
          setTimeout(() => {
             handleSelectContact(state.prefillAccount!, contactsData, isIntl);
          }, 0);
        }
      } catch (err) {
        console.error('Failed to fetch initial data', err);
      }
    };
    fetchInitialData();
  }, [location.state]);

  const currentSchema = paymentType === 'local' ? localSchema : internationalSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      currency: 'NAD',
      senderAccountNumber: '0987654321',
    },
  });

  const currencyValue = watch('currency');
  const amountValue = watch('amount');

  // Fetch exchange rate when currency changes
  useEffect(() => {
    if (paymentType === 'international' && currencyValue && currencyValue !== 'NAD') {
      setIsLoadingRate(true);
      if (availableRates[currencyValue]) {
         setExchangeRate(availableRates[currencyValue]);
         setIsLoadingRate(false);
      } else {
         // Fallback if not loaded yet
         const fetchRate = async () => {
           try {
             // Instead of a custom convert endpoint, we now rely on the dictionary from getRates
             // This is simpler and avoids an extra round trip for each selection if loaded upfront
             const rates = await api.getRates();
             setAvailableRates(rates);
             setExchangeRate(rates[currencyValue] || null);
           } catch(err) {
             setExchangeRate(null);
           } finally {
             setIsLoadingRate(false);
           }
         };
         fetchRate();
      }
    } else {
      setExchangeRate(null);
    }
  }, [currencyValue, paymentType, availableRates]);

  const receiverValue = watch('receiverAccountNumber');

  const handleSelectContact = (account: string, contactsList: Contact[] = contacts, forceIsInternational?: boolean) => {
    const selectedContact = contactsList.find(c => c.account === account);
    const isIntl = forceIsInternational !== undefined ? forceIsInternational : selectedContact?.isInternational;

    if (isIntl) {
      setPaymentType('international');
      if (selectedContact?.country === 'United Kingdom') {
         setValue('currency', 'GBP', { shouldValidate: true });
      } else if (selectedContact?.country === 'Germany') {
         setValue('currency', 'EUR', { shouldValidate: true });
      } else if (selectedContact?.country === 'South Africa') {
         setValue('currency', 'ZAR', { shouldValidate: true });
      } else if (selectedContact?.country === 'Botswana') {
         setValue('currency', 'BWP', { shouldValidate: true });
      } else {
         setValue('currency', 'USD', { shouldValidate: true });
      }
    } else {
      setPaymentType('local');
      setValue('currency', 'NAD', { shouldValidate: true });
    }

    // Set receiver account after currency so validators pass
    setValue('receiverAccountNumber', account, { shouldValidate: true });
    setShowContacts(false);
  };

  const selectContact = (account: string) => {
    handleSelectContact(account);
  };

  const onSubmit = async (data: PaymentFormValues) => {
    setIsSubmitting(true);
    setSuccessResponse(null);
    setErrorResponse(null);

    // Round the amount to 2 dp before sending
    const payload = { ...data, amount: Math.round(data.amount * 100) / 100 };

    try {
      const response = await api.processPayment(payload); // Use api.processPayment
      setSuccessResponse(response); // api.processPayment returns the data directly
      reset({ ...data, reference: '', amount: undefined as any, receiverAccountNumber: '' });
    } catch (err: any) {
      setErrorResponse(
        err.response?.data || { error: { message: 'Network or server error occurred.' } },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // When switching tabs, reset the form keeping sender
  const switchTab = (tab: 'local' | 'international') => {
    setPaymentType(tab);
    setSuccessResponse(null);
    setErrorResponse(null);
    reset({ currency: tab === 'local' ? 'NAD' : 'USD', senderAccountNumber: '0987654321' });
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in pb-10">
      {/* Header and Mock Balance */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Send Money</h2>
        <div className="bg-[#8B3A3A] rounded-2xl p-6 flex items-center justify-between text-white shadow-lg overflow-hidden relative">
          <div className="absolute right-0 top-0 h-full w-48 bg-white opacity-5 rounded-l-full translate-x-1/4"></div>
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-wider text-white/70 font-medium mb-1">
              Available from Account
            </p>
            <h3 className="text-3xl font-bold font-sans">N$ {fmt(1265565.39)}</h3>
          </div>
          <div className="text-right relative z-10">
            <p className="text-xs text-white/70 tracking-wide uppercase">Account Number</p>
            <p className="font-semibold tracking-wider font-mono">0987-654-321</p>
          </div>
        </div>
      </div>

      {/* ── Payment Type Tabs ──────────────────────────────────── */}
      <div className="flex mb-0 bg-gray-100 rounded-t-2xl p-1 gap-1">
        <button
          type="button"
          onClick={() => switchTab('local')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
            paymentType === 'local'
              ? 'bg-white text-[#8B3A3A] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MapPin size={16} />
          Local Payment
        </button>
        <button
          type="button"
          onClick={() => switchTab('international')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
            paymentType === 'international'
              ? 'bg-white text-[#8B3A3A] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Globe size={16} />
          International Payment
        </button>
      </div>

      {/* ── Form Card ──────────────────────────────────────────── */}
      <div className="bg-white rounded-b-2xl rounded-t-none shadow-sm border border-gray-100 p-8">
        {/* Success */}
        {successResponse && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl flex flex-col items-center text-center">
            <CheckCircle2 className="text-green-500 mb-3" size={48} />
            <h3 className="text-green-800 font-bold text-lg mb-1">
              {successResponse.message || 'Payment Successful!'}
            </h3>
            <p className="text-green-700 text-sm mb-4">Your funds have been securely transferred.</p>
            <div className="bg-white rounded-lg px-4 py-3 w-full max-w-sm flex flex-col gap-2 border border-green-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-semibold text-gray-800">{successResponse.transactionId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Client Ref</span>
                <span className="font-mono text-gray-800">{successResponse.clientReference}</span>
              </div>
            </div>
            <button
              onClick={() => setSuccessResponse(null)}
              className="mt-6 text-sm font-medium text-green-700 hover:text-green-800 hover:underline"
            >
              Send Another Payment
            </button>
          </div>
        )}

        {/* Error */}
        {errorResponse && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-red-800 font-semibold mb-1">Payment Failed</h3>
              <p className="text-red-700 text-sm">
                {errorResponse.error?.message || 'An unknown error occurred.'}
              </p>
              {errorResponse.error?.code && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded inline-block mt-2 font-mono">
                  ERR: {errorResponse.error.code}
                </span>
              )}
            </div>
            <button onClick={() => setErrorResponse(null)} className="ml-auto text-red-400 hover:text-red-600">
              ×
            </button>
          </div>
        )}

        {/* Form */}
        {!successResponse && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Sender / Receiver */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sender Account</label>
                <input
                  {...register('senderAccountNumber')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#8B3A3A]/20 transition-all font-mono"
                  readOnly
                />
                {errors.senderAccountNumber && (
                  <span className="text-red-500 text-xs">{errors.senderAccountNumber.message}</span>
                )}
              </div>

              {/* Receiver + Contact Dropdown */}
              <div className="space-y-2 relative">
                <label className="text-sm font-medium text-gray-700">Receiver Account</label>
                <div className="relative">
                  <input
                    {...register('receiverAccountNumber')}
                    className={`w-full px-4 py-3 pr-10 rounded-xl border ${
                      errors.receiverAccountNumber ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    } focus:outline-none focus:border-[#8B3A3A] focus:ring-2 focus:ring-[#8B3A3A]/20 transition-all font-mono`}
                    placeholder="Enter or select account"
                  />
                  <button
                    type="button"
                    onClick={() => setShowContacts(!showContacts)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B3A3A] transition-colors"
                    title="Select from contacts"
                  >
                    <ChevronDown size={18} className={`transition-transform ${showContacts ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Contact list dropdown */}
                  {showContacts && (
                    <div className="absolute z-30 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-52 overflow-y-auto">
                    {contacts.map((c) => (
                      <button
                        key={c.account}
                        type="button"
                        onClick={() => selectContact(c.account)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                          receiverValue === c.account ? 'bg-[#8B3A3A]/5' : ''
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                          {c.isInternational ? <Globe size={16} className="text-blue-500" /> : <User size={16} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-baseline">
                            <p className="text-sm font-bold text-gray-800 truncate">{c.name}</p>
                            <p className="text-[10px] font-mono text-gray-400">{c.bic}</p>
                          </div>
                          <div className="flex justify-between items-center mt-0.5">
                            <p className="text-xs text-gray-500 truncate">{c.bank}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{c.account}</p>
                          </div>
                        </div>
                        {receiverValue === c.account && (
                          <CheckCircle2 size={16} className="ml-auto text-[#8B3A3A] flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {errors.receiverAccountNumber && (
                  <span className="text-red-500 text-xs">{errors.receiverAccountNumber.message}</span>
                )}
              </div>
            </div>

            {/* Amount & Currency */}
            <div className="space-y-2 relative pt-2">
              <label className="text-sm font-medium text-gray-700">Amount &amp; Currency</label>
              <div className="flex rounded-xl overflow-hidden border border-gray-200 focus-within:border-[#8B3A3A] focus-within:ring-2 focus-within:ring-[#8B3A3A]/20 transition-all">
                {paymentType === 'local' ? (
                  <div className="bg-gray-50 px-4 py-3 border-r border-gray-200 text-sm font-bold text-gray-700 flex items-center select-none">
                    NAD
                  </div>
                ) : (
                  <select
                    {...register('currency')}
                    className="bg-gray-50 px-3 py-3 border-r border-gray-200 text-sm font-bold text-gray-700 focus:outline-none cursor-pointer"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  className={`flex-1 px-4 py-3 focus:outline-none font-bold text-lg text-gray-800 placeholder-gray-300 ${
                    errors.amount ? 'bg-red-50' : 'bg-white'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <span className="text-red-500 text-xs">{errors.amount.message}</span>
              )}

              {/* Exchange Rate Display */}
              {paymentType === 'international' && currencyValue !== 'NAD' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl animate-fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Exchange Rate</span>
                    {isLoadingRate ? (
                      <Loader2 size={14} className="animate-spin text-blue-400" />
                    ) : (
                      <span className="text-sm font-bold text-blue-800">
                        1 {currencyValue} = {exchangeRate ? fmt(exchangeRate) : '—'} NAD
                      </span>
                    )}
                  </div>
                  {exchangeRate && amountValue > 0 && (
                    <div className="pt-2 border-t border-blue-100 flex justify-between items-center">
                      <span className="text-sm text-blue-600">Estimated Cost</span>
                      <span className="text-lg font-black text-blue-900">
                         N$ {fmt(amountValue * exchangeRate)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reference */}
            <div className="space-y-2 relative pt-2">
              <label className="text-sm font-medium text-gray-700">Payment Reference</label>
              <input
                {...register('reference')}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.reference ? 'border-red-300 bg-red-50' : 'border-gray-200'
                } focus:outline-none focus:border-[#8B3A3A] focus:ring-2 focus:ring-[#8B3A3A]/20 transition-all`}
                placeholder="e.g. Rent Payment, Invoice #123"
              />
              {errors.reference && (
                <span className="text-red-500 text-xs">{errors.reference.message}</span>
              )}
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#8B3A3A] hover:bg-[#722F2F] text-white rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#8B3A3A]/20 hover:shadow-lg hover:shadow-[#8B3A3A]/30 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing Secure Transfer…
                  </>
                ) : (
                  <>
                    {paymentType === 'international' ? 'Send International Payment' : 'Send Payment Now'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span> Secure
                connection to IPN Gateway
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
