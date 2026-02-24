"use client";

import { useState } from "react";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="mx-auto mt-20 flex w-full max-w-md flex-col gap-3 rounded-lg border p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        if (!response.ok) {
          setError("Hibás jelszó.");
          return;
        }

        window.location.reload();
      }}
    >
      <h1 className="font-semibold text-xl">Admin belépés</h1>
      <input
        className="rounded border px-3 py-2"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Admin jelszó"
        type="password"
        value={password}
      />
      {error ? <p className="text-red-600 text-sm">{error}</p> : null}
      <button className="rounded bg-black px-3 py-2 text-white" type="submit">
        Belépés
      </button>
    </form>
  );
}
