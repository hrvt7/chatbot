"use client";

import { useEffect, useState } from "react";
import { AdminLogin } from "./admin-login";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  preferredTime: string | null;
  message: string;
  createdAt: string;
};

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const loadLeads = async () => {
      const response = await fetch("/api/leads");
      if (!response.ok) {
        setAuthenticated(false);
        return;
      }

      const data = await response.json();
      setLeads(data.leads);
      setAuthenticated(true);
    };

    loadLeads();
  }, []);

  if (!authenticated) {
    return <AdminLogin />;
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 font-semibold text-2xl">Visszahívási kérések</h1>
      <div className="overflow-auto rounded border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-3 py-2">Név</th>
              <th className="px-3 py-2">Telefon</th>
              <th className="px-3 py-2">E-mail</th>
              <th className="px-3 py-2">Preferált idő</th>
              <th className="px-3 py-2">Üzenet</th>
              <th className="px-3 py-2">Létrehozva</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr className="border-b align-top" key={lead.id}>
                <td className="px-3 py-2">{lead.name}</td>
                <td className="px-3 py-2">{lead.phone}</td>
                <td className="px-3 py-2">{lead.email || "-"}</td>
                <td className="px-3 py-2">{lead.preferredTime || "-"}</td>
                <td className="max-w-sm whitespace-pre-wrap px-3 py-2">{lead.message}</td>
                <td className="px-3 py-2">{new Date(lead.createdAt).toLocaleString("hu-HU")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
