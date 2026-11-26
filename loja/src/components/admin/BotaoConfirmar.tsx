"use client";
export default function BotaoConfirmar({ msg, className, children }: { msg: string; className?: string; children: React.ReactNode }) {
  return (
    <button type="submit" className={className} onClick={(e) => { if (!confirm(msg)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
