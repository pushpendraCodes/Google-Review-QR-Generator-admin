import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Crown, IndianRupee, DollarSign, Loader2, RotateCcw, Save, Users } from 'lucide-react';
import {
  useGetPricingSettingsQuery,
  useUpdatePricingSettingsMutation,
  type BillingCycle,
  type PaidPlan,
  type PricingConfig,
  type PricingCurrency,
} from '../../store/api/adminSettingsApi';
import { timeAgo } from '../../lib/format';

const PLANS: { key: PaidPlan; label: string }[] = [
  { key: 'starter', label: 'Starter' },
  { key: 'pro', label: 'Pro' },
  { key: 'agency', label: 'Agency' },
];
const CYCLES: BillingCycle[] = ['monthly', 'annual'];
const CURRENCIES: PricingCurrency[] = ['INR', 'USD'];
const SYMBOL: Record<PricingCurrency, string> = { INR: '₹', USD: '$' };

/** Form values are major units (₹ / $) as strings so inputs can be edited freely. */
type MoneyForm = Record<PricingCurrency, string>;
interface FormState {
  plans: Record<PaidPlan, Record<BillingCycle, MoneyForm>>;
  includedSeats: string;
  maxSeats: string;
  seatPrice: MoneyForm;
}

const toMajor = (minor: number) => String(minor / 100);
const toMinor = (major: string) => Math.round(Number(major) * 100);
const moneyToForm = (m: Record<PricingCurrency, number>): MoneyForm => ({ INR: toMajor(m.INR), USD: toMajor(m.USD) });

const configToForm = (c: PricingConfig): FormState => ({
  plans: {
    starter: { monthly: moneyToForm(c.plans.starter.monthly), annual: moneyToForm(c.plans.starter.annual) },
    pro: { monthly: moneyToForm(c.plans.pro.monthly), annual: moneyToForm(c.plans.pro.annual) },
    agency: { monthly: moneyToForm(c.plans.agency.monthly), annual: moneyToForm(c.plans.agency.annual) },
  },
  includedSeats: String(c.team.includedSeats),
  maxSeats: String(c.team.maxSeats),
  seatPrice: moneyToForm(c.team.seatPriceMonthly),
});

const formToConfig = (f: FormState): PricingConfig => {
  const money = (m: MoneyForm) => ({ INR: toMinor(m.INR), USD: toMinor(m.USD) });
  return {
    plans: {
      starter: { monthly: money(f.plans.starter.monthly), annual: money(f.plans.starter.annual) },
      pro: { monthly: money(f.plans.pro.monthly), annual: money(f.plans.pro.annual) },
      agency: { monthly: money(f.plans.agency.monthly), annual: money(f.plans.agency.annual) },
    },
    team: {
      includedSeats: Number(f.includedSeats),
      maxSeats: Number(f.maxSeats),
      seatPriceMonthly: money(f.seatPrice),
    },
  };
};

const MIN: Record<PricingCurrency, number> = { INR: 1, USD: 0.5 };

const validate = (f: FormState): string | null => {
  for (const { key, label } of PLANS) {
    for (const cycle of CYCLES) {
      for (const cur of CURRENCIES) {
        const v = Number(f.plans[key][cycle][cur]);
        if (!Number.isFinite(v) || v < MIN[cur]) return `${label} ${cycle} ${cur} price must be at least ${SYMBOL[cur]}${MIN[cur]}.`;
      }
    }
  }
  const inc = Number(f.includedSeats);
  const max = Number(f.maxSeats);
  if (!Number.isInteger(inc) || inc < 0 || inc > 100) return 'Included seats must be a whole number from 0 to 100.';
  if (!Number.isInteger(max) || max < inc || max > 100) return 'Maximum seats must be a whole number between the included seats and 100.';
  for (const cur of CURRENCIES) {
    const v = Number(f.seatPrice[cur]);
    if (!Number.isFinite(v) || v < MIN[cur]) return `Extra seat ${cur} price must be at least ${SYMBOL[cur]}${MIN[cur]}.`;
  }
  return null;
};

const PriceInput = ({
  currency,
  value,
  onChange,
  suffix,
}: {
  currency: PricingCurrency;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) => (
  <div className="relative">
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{SYMBOL[currency]}</span>
    <input
      type="number"
      inputMode="decimal"
      min={MIN[currency]}
      step={currency === 'INR' ? 1 : 0.01}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[#D1E7DA] bg-white py-2 pl-7 pr-3 text-sm tabular-nums outline-none transition-all focus:border-[#1A6B45] focus:ring-4 focus:ring-[#1A6B45]/10"
    />
    {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">{suffix}</span>}
  </div>
);

const annualHint = (monthly: string, annual: string) => {
  const m = Number(monthly);
  const a = Number(annual);
  if (!m || !a) return null;
  const pct = Math.round(((m * 12 - a) / (m * 12)) * 100);
  if (a <= m) return { tone: 'warn' as const, text: 'Annual is no more than one month — customers get 12 months for this price.' };
  if (pct > 0) return { tone: 'ok' as const, text: `${pct}% off vs paying monthly` };
  return { tone: 'warn' as const, text: 'Annual costs more than 12 monthly payments.' };
};

const PricingForm = ({
  initial,
  highestExtraSeats,
  updatedAt,
}: {
  initial: PricingConfig;
  highestExtraSeats: number;
  updatedAt: string | null;
}) => {
  const initialForm = useMemo(() => configToForm(initial), [initial]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [save, { isLoading }] = useUpdatePricingSettingsMutation();

  const dirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const error = validate(form);
  const maxExtra = Math.max(0, Number(form.maxSeats) - Number(form.includedSeats));
  const capsCustomers = Number.isFinite(maxExtra) && highestExtraSeats > maxExtra;

  const setPlan = (plan: PaidPlan, cycle: BillingCycle, cur: PricingCurrency, v: string) =>
    setForm((f) => ({
      ...f,
      plans: { ...f.plans, [plan]: { ...f.plans[plan], [cycle]: { ...f.plans[plan][cycle], [cur]: v } } },
    }));

  const handleSave = async () => {
    if (error) return;
    try {
      await save(formToConfig(form)).unwrap();
      setNotice({ type: 'success', text: 'Pricing saved. The website and checkout use the new prices within a minute.' });
    } catch (err) {
      setNotice({ type: 'error', text: (err as { data?: { message?: string } })?.data?.message || 'Failed to save pricing' });
    }
  };

  return (
    <div className="space-y-5">
      {notice && (
        <div
          className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
            notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {notice.type === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
          {notice.text}
        </div>
      )}

      {/* Plan prices */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <Crown className="h-4 w-4 text-[#1A6B45]" />
          <h2 className="text-sm font-semibold text-gray-800">Plan prices</h2>
        </div>
        <p className="mb-5 text-xs text-gray-400">
          <IndianRupee className="inline h-3 w-3" /> INR is charged with Razorpay (India), <DollarSign className="inline h-3 w-3" /> USD with
          Lemon Squeezy (international). Annual is the total charged once per year.
        </p>

        <div className="space-y-5">
          {PLANS.map(({ key, label }) => (
            <div key={key} className="rounded-xl bg-[#F8FBF9] p-4">
              <p className="mb-3 text-sm font-semibold text-gray-800">{label}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {CYCLES.map((cycle) => {
                  const hints = cycle === 'annual'
                    ? CURRENCIES.map((cur) => annualHint(form.plans[key].monthly[cur], form.plans[key].annual[cur])).find(Boolean)
                    : null;
                  return (
                    <div key={cycle}>
                      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                        {cycle === 'monthly' ? 'Monthly' : 'Annual (per year)'}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {CURRENCIES.map((cur) => (
                          <PriceInput key={cur} currency={cur} value={form.plans[key][cycle][cur]} onChange={(v) => setPlan(key, cycle, cur, v)} />
                        ))}
                      </div>
                      {hints && (
                        <p className={`mt-1.5 text-[11px] ${hints.tone === 'ok' ? 'text-emerald-600' : 'text-amber-600'}`}>{hints.text}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team seats */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <Users className="h-4 w-4 text-[#1A6B45]" />
          <h2 className="text-sm font-semibold text-gray-800">Agency team seats</h2>
        </div>
        <p className="mb-5 text-xs text-gray-400">
          Team members an Agency owner can invite (the owner isn&apos;t counted). Extra seats are bought on the Team page, charged only for the days
          left on the plan, and added to each Agency renewal.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">Included with Agency</label>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={form.includedSeats}
              onChange={(e) => setForm((f) => ({ ...f, includedSeats: e.target.value }))}
              className="w-full rounded-lg border border-[#D1E7DA] px-3 py-2 text-sm tabular-nums outline-none focus:border-[#1A6B45] focus:ring-4 focus:ring-[#1A6B45]/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">Maximum team size (with extra seats)</label>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={form.maxSeats}
              onChange={(e) => setForm((f) => ({ ...f, maxSeats: e.target.value }))}
              className="w-full rounded-lg border border-[#D1E7DA] px-3 py-2 text-sm tabular-nums outline-none focus:border-[#1A6B45] focus:ring-4 focus:ring-[#1A6B45]/10"
            />
            <p className="mt-1 text-[11px] text-gray-400">Up to {maxExtra} extra seat{maxExtra === 1 ? '' : 's'} can be bought.</p>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-gray-500">Extra seat price</label>
            <div className="grid grid-cols-2 gap-2 sm:max-w-sm">
              {CURRENCIES.map((cur) => (
                <PriceInput
                  key={cur}
                  currency={cur}
                  value={form.seatPrice[cur]}
                  onChange={(v) => setForm((f) => ({ ...f, seatPrice: { ...f.seatPrice, [cur]: v } }))}
                  suffix="/ month"
                />
              ))}
            </div>
          </div>
        </div>

        {capsCustomers && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            A customer already has {highestExtraSeats} extra seats. With this limit they&apos;d be capped at {maxExtra}; existing members stay, but
            they can&apos;t invite more until under the limit.
          </div>
        )}
      </section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white/95 px-5 py-3 shadow-lg backdrop-blur">
        <p className={`text-xs ${error && dirty ? 'text-red-600' : 'text-gray-400'}`}>
          {error && dirty
            ? error
            : dirty
              ? 'You have unsaved changes. Existing paid plans keep their price until renewal.'
              : updatedAt
                ? `Last saved ${timeAgo(updatedAt)}`
                : 'Using default prices (never saved).'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setForm(initialForm);
              setNotice(null);
            }}
            disabled={!dirty || isLoading}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || !!error || isLoading}
            className="flex items-center gap-2 rounded-lg bg-[#1A6B45] px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#165a3a] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save pricing
          </button>
        </div>
      </div>
    </div>
  );
};

const PricingSettings = () => {
  const { data, isLoading, isError, refetch } = useGetPricingSettingsQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-white" />)}
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <p className="text-sm text-gray-500">Couldn&apos;t load pricing.</p>
        <button onClick={() => refetch()} className="mt-3 text-sm font-semibold text-[#1A6B45] hover:underline">Try again</button>
      </div>
    );
  }

  return (
    <PricingForm
      key={data.pricing.updatedAt ?? 'default'}
      initial={data.pricing}
      highestExtraSeats={data.highestExtraSeats}
      updatedAt={data.pricing.updatedAt}
    />
  );
};

export default PricingSettings;
