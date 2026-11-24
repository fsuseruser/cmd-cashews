"use client";

import { useState } from "react";
import { BANK } from "@/lib/config";

function CopyBtn({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={`copy${done ? " done" : ""}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {}
      }}
      aria-label={`Copy ${value}`}
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}

export function BankDetails({ amount, reference }: { amount?: string; reference?: string }) {
  return (
    <div className="bank">
      <span className="eyebrow">Pay by bank transfer</span>
      <div className="bank-rows">
        <div className="bank-row">
          <div>
            <small>Account number</small>
            <b className="acc">{BANK.accountNumber}</b>
          </div>
          <CopyBtn value={BANK.accountNumber} />
        </div>
        <div className="bank-row">
          <div>
            <small>Account name</small>
            <b>{BANK.accountName}</b>
          </div>
          <CopyBtn value={BANK.accountName} />
        </div>
        <div className="bank-row">
          <div>
            <small>Bank / branch</small>
            <b>
              {BANK.bank} · {BANK.branch}
            </b>
          </div>
        </div>
        {reference && (
          <div className="bank-row">
            <div>
              <small>Reference</small>
              <b>{reference}</b>
            </div>
            <CopyBtn value={reference} />
          </div>
        )}
        {amount && (
          <div className="bank-row" style={{ borderBottom: 0, paddingBottom: 0 }}>
            <div>
              <small>Amount to transfer</small>
              <b className="acc" style={{ color: "#D2B07A" }}>
                {amount}
              </b>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
