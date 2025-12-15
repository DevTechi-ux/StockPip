import React from "react";

export default function AccountInfo() {
  return (
    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
      <div className="rounded border bg-card p-2"><div className="text-[10px]">Account Type</div><div className="text-xs text-foreground">Standard</div></div>
      <div className="rounded border bg-card p-2"><div className="text-[10px]">Leverage</div><div className="text-xs text-foreground">1:100</div></div>
      <div className="rounded border bg-card p-2"><div className="text-[10px]">Base Currency</div><div className="text-xs text-foreground">USD</div></div>
      <div className="rounded border bg-card p-2"><div className="text-[10px]">Country</div><div className="text-xs text-foreground">-</div></div>
    </div>
  );
}
