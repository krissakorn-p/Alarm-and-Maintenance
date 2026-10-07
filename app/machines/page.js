"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth, Err } from "@/components/Shell";
import { validateMachine, MACHINE_STATUS } from "@/lib/validate.mjs";
const empty = { machine_id: "", name: "", type: "", location: "", status: "Running" };
export default function Machines() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState([]), [f, setF] = useState(empty), [editing, setEditing] = useState(null), [err, setErr] = useState({}), [q, setQ] = useState(""), [st, setSt] = useState(""), [msg, setMsg] = useState("");
  const load = async () => { const { data } = await supabase.from("machines").select("*").order("machine_id"); setRows(data || []); };
  useEffect(() => { load(); }, []);
  async function save(e) {
    e.preventDefault();
    const ids = rows.filter((r) => r.id !== editing).map((r) => r.machine_id.toLowerCase());
    const v = validateMachine(f, ids); setErr(v); if (Object.keys(v).length) return;
    const body = { machine_id: f.machine_id.trim(), name: f.name.trim(), type: f.type.trim(), location: f.location.trim(), status: f.status };
    const { error } = editing ? await supabase.from("machines").update(body).eq("id", editing) : await supabase.from("machines").insert(body);
    if (error) return setMsg(error.message);
    setMsg(""); setF(empty); setEditing(null); load();
  }
  async function del(id) { if (confirm("ลบเครื่องจักรนี้?")) { const { error } = await supabase.from("machines").delete().eq("id", id); if (error) setMsg(error.message); load(); } }
  const shown = rows.filter((r) => (!st || r.status === st) && (!q || `${r.machine_id} ${r.name} ${r.location}`.toLowerCase().includes(q.toLowerCase())));
  const F = (k, l) => (<label className="text-xs">{l}<input className="inp" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /><Err m={err[k]} /></label>);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Machine Master</h1>
      {isAdmin && (
        <form onSubmit={save} className="grid gap-2 rounded bg-white p-4 shadow md:grid-cols-6">
          {F("machine_id", "Machine ID")}{F("name", "Name")}{F("type", "Type")}{F("location", "Location")}
          <label className="text-xs">Status<select className="inp" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{MACHINE_STATUS.map((s) => <option key={s}>{s}</option>)}</select></label>
          <div className="flex items-end gap-1"><button className="btn">{editing ? "Update" : "Add"}</button>
            {editing && <button type="button" className="btn2" onClick={() => { setEditing(null); setF(empty); setErr({}); }}>Cancel</button>}</div>
        </form>)}
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <div className="flex gap-2"><input className="inp max-w-xs" placeholder="ค้นหา ID / ชื่อ / Location" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="inp max-w-40" value={st} onChange={(e) => setSt(e.target.value)}><option value="">ทุกสถานะ</option>{MACHINE_STATUS.map((s) => <option key={s}>{s}</option>)}</select></div>
      <div className="overflow-x-auto rounded bg-white shadow"><table className="w-full"><thead><tr>{["ID", "Name", "Type", "Location", "Status", ""].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
        <tbody>{shown.map((r) => (<tr key={r.id} className="border-t"><td className="td">{r.machine_id}</td><td className="td">{r.name}</td><td className="td">{r.type}</td><td className="td">{r.location}</td><td className="td">{r.status}</td>
          <td className="td space-x-1">{isAdmin && <><button className="btn2" onClick={() => { setEditing(r.id); setF(r); }}>Edit</button><button className="btn2 text-red-600" onClick={() => del(r.id)}>Delete</button></>}</td></tr>))}
          {!shown.length && <tr><td className="td" colSpan={6}>ไม่พบข้อมูล</td></tr>}</tbody></table></div>
    </div>);
}
