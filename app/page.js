"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
const color = { Running: "bg-green-100", Stop: "bg-slate-200", Alarm: "bg-red-100", Maintenance: "bg-yellow-100" };
const Card = ({ t, v, c = "bg-white" }) => <div className={`rounded p-4 shadow ${c}`}><p className="text-xs text-slate-500">{t}</p><p className="text-3xl font-bold">{v}</p></div>;
export default function Dashboard() {
  const [d, setD] = useState(null);
  useEffect(() => { (async () => {
    const [m, a, r] = await Promise.all([supabase.from("machines").select("status"), supabase.from("alarms").select("status"), supabase.from("maintenance_records").select("status")]);
    const c = (rows, k) => (rows.data || []).filter((x) => x.status === k).length;
    setD({ total: m.data?.length || 0, st: ["Running", "Stop", "Alarm", "Maintenance"].map((k) => [k, c(m, k)]),
      alarms: a.data?.length || 0, open: c(a, "Open"), prog: c(a, "In Progress"), closed: c(a, "Closed"),
      mt: r.data?.length || 0, mtOpen: (r.data || []).filter((x) => x.status !== "Done").length });
  })(); }, []);
  if (!d) return <p>Loading...</p>;
  const max = Math.max(1, d.open, d.prog, d.closed);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Card t="Machines ทั้งหมด" v={d.total} />{d.st.map(([k, v]) => <Card key={k} t={k} v={v} c={color[k]} />)}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card t="Alarm ทั้งหมด" v={d.alarms} /><Card t="Alarm Open" v={d.open} c="bg-red-50" />
        <Card t="Maintenance ทั้งหมด" v={d.mt} /><Card t="Maintenance ค้างอยู่" v={d.mtOpen} c="bg-yellow-50" />
      </div>
      <div className="rounded bg-white p-4 shadow"><p className="mb-2 text-sm font-semibold">Alarm ตามสถานะ</p>
        {[["Open", d.open], ["In Progress", d.prog], ["Closed", d.closed]].map(([k, v]) => (
          <div key={k} className="mb-1 flex items-center gap-2 text-xs"><span className="w-20">{k}</span>
            <div className="h-4 bg-blue-500" style={{ width: `${(v / max) * 70}%`, minWidth: 2 }} /><span>{v}</span></div>))}
      </div>
    </div>);
}
