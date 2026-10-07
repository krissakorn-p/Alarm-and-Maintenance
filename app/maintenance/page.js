"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth, Err } from "@/components/Shell";
import { validateMaintenance } from "@/lib/validate.mjs";
const ST = ["Planned", "In Progress", "Done"];
const today = () => new Date().toISOString().slice(0, 10);
const empty = () => ({ machine_id: "", description: "", performed_at: today(), status: "Planned" });
export default function Maintenance() {
  const { id: uid, isAdmin } = useAuth();
  const [rows, setRows] = useState([]), [ms, setMs] = useState([]), [f, setF] = useState(empty()), [editing, setEditing] = useState(null), [err, setErr] = useState({}), [msg, setMsg] = useState("");
  const [fs, setFs] = useState(""), [fm, setFm] = useState(""), [d1, setD1] = useState(""), [d2, setD2] = useState("");
  const load = async () => {
    const [r, m] = await Promise.all([supabase.from("maintenance_records").select("*, machines(machine_id,name), profiles(full_name)").order("performed_at", { ascending: false }), supabase.from("machines").select("id,machine_id,name").order("machine_id")]);
    setRows(r.data || []); setMs(m.data || []);
  };
  useEffect(() => { load(); }, []);
  async function save(e) {
    e.preventDefault(); const v = validateMaintenance(f); setErr(v); if (Object.keys(v).length) return;
    const body = { machine_id: f.machine_id, description: f.description.trim(), performed_at: f.performed_at, status: f.status };
    const { error } = editing ? await supabase.from("maintenance_records").update(body).eq("id", editing) : await supabase.from("maintenance_records").insert({ ...body, technician_id: uid });
    if (error) return setMsg(error.message); setMsg(""); setF(empty()); setEditing(null); load();
  }
  async function del(id) { if (confirm("ลบรายการ?")) { await supabase.from("maintenance_records").delete().eq("id", id); load(); } }
  const shown = rows.filter((r) => (!fs || r.status === fs) && (!fm || r.machine_id === fm) && (!d1 || r.performed_at >= d1) && (!d2 || r.performed_at <= d2));
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Maintenance Records</h1>
      <form onSubmit={save} className="grid gap-2 rounded bg-white p-4 shadow md:grid-cols-5">
        <label className="text-xs">Machine<select className="inp" value={f.machine_id} onChange={(e) => setF({ ...f, machine_id: e.target.value })}><option value="">-- เลือก --</option>{ms.map((m) => <option key={m.id} value={m.id}>{m.machine_id} - {m.name}</option>)}</select><Err m={err.machine_id} /></label>
        <label className="text-xs md:col-span-2">รายละเอียดการซ่อม<input className="inp" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /><Err m={err.description} /></label>
        <label className="text-xs">วันที่<input type="date" className="inp" value={f.performed_at} onChange={(e) => setF({ ...f, performed_at: e.target.value })} /><Err m={err.performed_at} /></label>
        <label className="text-xs">Status<select className="inp" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{ST.map((s) => <option key={s}>{s}</option>)}</select></label>
        <div className="flex gap-1"><button className="btn">{editing ? "Update" : "Add"}</button>{editing && <button type="button" className="btn2" onClick={() => { setEditing(null); setF(empty()); }}>Cancel</button>}</div>
      </form>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <div className="flex flex-wrap gap-2">
        <select className="inp max-w-40" value={fs} onChange={(e) => setFs(e.target.value)}><option value="">ทุกสถานะ</option>{ST.map((s) => <option key={s}>{s}</option>)}</select>
        <select className="inp max-w-48" value={fm} onChange={(e) => setFm(e.target.value)}><option value="">ทุกเครื่อง</option>{ms.map((m) => <option key={m.id} value={m.id}>{m.machine_id}</option>)}</select>
        <input type="date" className="inp max-w-40" value={d1} onChange={(e) => setD1(e.target.value)} /><input type="date" className="inp max-w-40" value={d2} onChange={(e) => setD2(e.target.value)} /></div>
      <div className="overflow-x-auto rounded bg-white shadow"><table className="w-full"><thead><tr>{["Machine", "รายละเอียด", "วันที่", "Technician", "Status", ""].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
        <tbody>{shown.map((r) => (<tr key={r.id} className="border-t"><td className="td">{r.machines?.machine_id}</td><td className="td">{r.description}</td><td className="td">{r.performed_at}</td><td className="td">{r.profiles?.full_name || "-"}</td><td className="td">{r.status}</td>
          <td className="td space-x-1"><button className="btn2" onClick={() => { setEditing(r.id); setF({ machine_id: r.machine_id, description: r.description, performed_at: r.performed_at, status: r.status }); }}>Edit</button>{isAdmin && <button className="btn2 text-red-600" onClick={() => del(r.id)}>Delete</button>}</td></tr>))}
          {!shown.length && <tr><td className="td" colSpan={6}>ไม่พบข้อมูล</td></tr>}</tbody></table></div>
    </div>);
}
