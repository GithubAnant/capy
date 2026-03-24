"use client";

import { useState, useRef, useEffect } from "react";
import { clients, type Client } from "@/lib/clients";

function PlaceholderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <rect width="16" height="16" rx="4" fill="#2a2a2a" />
      <path d="M4.5 8h7M8 4.5v7" stroke="#858585" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ClientPicker({
  selected,
  onSelect,
}: {
  selected: Client;
  onSelect: (client: Client) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#171615] px-4 py-2.5 text-[0.85rem] font-medium text-[#F0F0F3] transition-colors hover:bg-white/10"
      >
        {selected.icon ? (
          <img src={selected.icon} alt={selected.name} className="h-4 w-4 shrink-0" />
        ) : (
          <PlaceholderIcon />
        )}
        {selected.name}
        <svg
          className={`h-4 w-4 text-[#858585] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl bg-[#1c1b1a] py-1 shadow-2xl ring-1 ring-white/10">
          {([
            { label: "Agents", category: "agent" },
            { label: "IDEs", category: "ide" },
          ] as const).map((group, idx) => (
            <div key={group.category}>
              {idx > 0 && <div className="mx-3 my-1 border-t border-white/5" />}
              <p className="px-3 pb-1 pt-2 text-[0.7rem] font-medium uppercase tracking-wider text-[#585858]">
                {group.label}
              </p>
              {clients
                .filter((c) => c.category === group.category)
                .map((client) => (
                  <button
                    key={client.name}
                    type="button"
                    onClick={() => {
                      onSelect(client);
                      setOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[0.85rem] transition-colors hover:bg-white/5 ${
                      selected.name === client.name ? "text-[#F0F0F3]" : "text-[#858585]"
                    }`}
                  >
                    {client.icon ? (
                      <img src={client.icon} alt={client.name} className="h-4 w-4 shrink-0" />
                    ) : (
                      <PlaceholderIcon />
                    )}
                    {client.name}
                    {selected.name === client.name && (
                      <svg className="ml-auto h-4 w-4 text-[#E8E0D6]" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
