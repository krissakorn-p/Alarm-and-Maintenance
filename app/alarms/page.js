"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth, Err } from "@/components/Shell";
import { validateAlarm } from "@/lib/validate.mjs";
const ST = ["Open", "In Progress", "Closed"];
const empty = { machine_id: "", alarm_code: "", description: "", cause: "", occurred_at: "", status: "Open" };
export default function Alarms() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState([]), [ms, setMs] = useState([]), [f, setF] = useState(empty), [err, setErr] = useState({}), [msg, setMsg] = useState("");
  const [fs, setFs] = useState(""), [fm, setFm] = useState(""), [fc, setFc] = useState("");
  const load = async () => {
    const [a, m] = await Promise.all([supabase.from("alarms").select("*, machines(machine_id,name)").order("occurred_at", { ascending: false }), supabase.from("machines").select("id,machine_id,name").order("machine_id")]);
    setRows(a.data || []); setMs(m.data || []);
  };
  useEffect(() => { load(); }, []);
  async function add(e) {
    e.preventDefault(); const v = validateAlarm(f); setErr(v); if (Object.keys(v).length) return;
    const { error } = await supabase.from("alarms").insert({ ...f, alarm_code: f.alarm_code.trim(), occurred_at: new Date(f.occurred_at).toISOString() });
    if (error) return setMsg(error.message); setMsg(""); setF(empty); load();
  }
  async function setStatus(id, status) { const { error } = await supabase.from("alarms").update({ status }).eq("id", id); if (error) setMsg(error.message); load(); }
  const shown = rows.filter((r) => (!fs || r.status === fs) && (!fm || r.machine_id === fm) && (!fc || r.alarm_code.toLowerCase().includes(fc.toLowerCase())));
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Alarm Records</h1>
      {isAdmin && (
        <form onSubmit={add} className="grid gap-2 rounded bg-white p-4 shadow md:grid-cols-3">
          <label className="text-xs">Machine<select className="inp" value={f.machine_id} onChange={(e) => setF({ ...f, machine_id: e.target.value })}><option value="">-- เลือก --</option>{ms.map((m) => <option key={m.id} value={m.id}>{m.machine_id} - {m.name}</option>)}</select><Err m={err.machine_id} /></label>
          <label className="text-xs">Alarm Code<input className="inp" value={f.alarm_code} onChange={(e) => setF({ ...f, alarm_code: e.target.value })} /><Err m={err.alarm_code} /></label>
          <label className="text-xs">Date/Time<input type="datetime-local" className="inp" value={f.occurred_at} onChange={(e) => setF({ ...f, occurred_at: e.target.value })} /><Err m={err.occurred_at} /></label>
          <label className="text-xs md:col-span-2">Description<input className="inp" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /><Err m={err.description} /></label>
          <label className="text-xs">Cause<input className="inp" value={f.cause} onChange={(e) => setF({ ...f, cause: e.target.value })} /></label>
          <button className="btn w-24">Add</button>
        </form>)}
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <div className="flex flex-wrap gap-2">
        <select className="inp max-w-40" value={fs} onChange={(e) => setFs(e.target.value)}><option value="">ทุกสถานะ</option>{ST.map((s) => <option key={s}>{s}</option>)}</select>
        <select className="inp max-w-48" value={fm} onChange={(e) => setFm(e.target.value)}><option value="">ทุกเครื่อง</option>{ms.map((m) => <option key={m.id} value={m.id}>{m.machine_id}</option>)}</select>
        <input className="inp max-w-40" placeholder="Alarm Code" value={fc} onChange={(e) => setFc(e.target.value)} /></div>
      <div className="overflow-x-auto rounded bg-white shadow"><table className="w-full"><thead><tr>{["Machine", "Code", "Description", "Cause", "Date/Time", "Status"].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
        <tbody>{shown.map((r) => (<tr key={r.id} className="border-t"><td className="td">{r.machines?.machine_id}</td><td className="td">{r.alarm_code}</td><td className="td">{r.description}</td><td className="td">{r.cause}</td><td className="td">{new Date(r.occurred_at).toLocaleString()}</td>
          <td className="td"><select className="inp" value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>{ST.map((s) => <option key={s}>{s}</option>)}</select></td></tr>))}
          {!shown.length && <tr><td className="td" colSpan={6}>ไม่พบข้อมูล</td></tr>}</tbody></table></div>
    </div>);
}
