"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
const Ctx = createContext({});
export const useAuth = () => useContext(Ctx);
export function Err({ m }) { return m ? <p className="mt-0.5 text-xs text-red-600">{m}</p> : null; }
const links = [["/", "Dashboard"], ["/machines", "Machines"], ["/alarms", "Alarms"], ["/maintenance", "Maintenance"]];
export default function Shell({ children }) {
  const path = usePathname(), router = useRouter();
  const [profile, setProfile] = useState(null), [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setReady(true); if (path !== "/login") router.replace("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      setProfile({ id: session.user.id, email: session.user.email, role: data?.role || "technician" });
      setReady(true);
      if (path === "/login") router.replace("/");
    })();
  }, [path]);
  if (path === "/login") return children;
  if (!ready || !profile) return <p className="p-6 text-sm">Loading...</p>;
  return (
    <Ctx.Provider value={{ ...profile, isAdmin: profile.role === "admin" }}>
      <nav className="flex flex-wrap items-center gap-4 bg-slate-900 px-4 py-3 text-sm text-white">
        <b>⚙ Alarm &amp; Maintenance</b>
        {links.map(([h, l]) => <Link key={h} href={h} className={path === h ? "underline" : "opacity-80"}>{l}</Link>)}
        <span className="ml-auto text-xs opacity-80">{profile.email} ({profile.role})</span>
        <button className="btn2 !text-white" onClick={async () => { await supabase.auth.signOut(); setProfile(null); router.replace("/login"); }}>Logout</button>
      </nav>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </Ctx.Provider>);
}
