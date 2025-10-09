'use client';

import PremiumGate from '@/app/components/premium/PremiumGate';
import { useEffect, useState, useMemo } from 'react';

function pmt(rateMo: number, nper: number, pv: number) {
  return (pv * rateMo) / (1 - Math.pow(1 + rateMo, -nper));
}

const fmt = (v: number) => v.toLocaleString(undefined, { 
  style: 'currency', 
  currency: 'USD', 
  maximumFractionDigits: 0 
});

export default function HouseHack() {
  const [price, setPrice] = useState(400000);
  const [rate, setRate] = useState(6.5);
  const [tax, setTax] = useState(4800);
  const [ins, setIns] = useState(1600);
  const [bah, setBah] = useState(2400);
  const [rent, setRent] = useState(2200);

  // prefill via query
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const n = (k: string, d: number) => Number(p.get(k) ?? d);
    setPrice(n('price', 400000));
    setRate(n('rate', 6.5));
    setTax(n('tax', 4800));
    setIns(n('ins', 1600));
    setBah(n('bah', 2400));
    setRent(n('rent', 2200));
  }, []);

  const costs = useMemo(() => {
    const rMo = (rate / 100) / 12;
    const piti = pmt(rMo, 360, price) + tax / 12 + ins / 12;
    return piti;
  }, [price, rate, tax, ins]);

  const income = bah + rent;
  const verdict = income - costs; // do not render if not premium

  return (
    <div className="space-y-6">
      <div className="rounded border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Num label="Price" v={price} set={setPrice} />
          <Num label="Rate (%)" v={rate} set={setRate} step={0.1} />
          <Num label="Tax (yr)" v={tax} set={setTax} />
          <Num label="Insurance (yr)" v={ins} set={setIns} />
          <Num label="BAH (mo)" v={bah} set={setBah} />
          <Num label="Tenant rent (mo)" v={rent} set={setRent} />
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Assumes 30-year VA loan. Education only.
        </div>
      </div>

      <div className="rounded border bg-white p-6 shadow-sm">
        <div className="text-sm">
          Total monthly costs (PITI): 
          <span className="font-semibold ml-2">{fmt(costs)}</span>
        </div>
        <div className="text-sm">
          Total monthly income (BAH + rent): 
          <span className="font-semibold ml-2">{fmt(income)}</span>
        </div>
      </div>

      <PremiumGate
        placeholder={
          <div>
            <div className="text-lg font-semibold mb-2">Unlock verdict</div>
            <p className="text-sm text-gray-600">
              See if this scenario is likely cash-flow positive.
            </p>
          </div>
        }
      >
        <div className="rounded border bg-white p-6 shadow-sm">
          <div className={`text-xl font-bold ${verdict >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {verdict >= 0 ? 'Est. monthly cash flow' : 'Est. out-of-pocket'}: {fmt(verdict)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Before vacancy, maintenance, and property management allowances.
          </div>
        </div>
      </PremiumGate>
    </div>
  );
}

function Num({ 
  label, 
  v, 
  set, 
  step = 100 
}: { 
  label: string; 
  v: number; 
  set: (n: number) => void; 
  step?: number 
}) {
  return (
    <label className="text-sm">
      {label}
      <input 
        type="number" 
        value={v} 
        onChange={e => set(Number(e.target.value))}
        step={step} 
        className="block w-full mt-1 border rounded px-2 py-1" 
      />
    </label>
  );
}
