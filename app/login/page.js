"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
export default function Login() {
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [msg, setMsg] = useState(""), [up, setUp] = useState(false);
  const router = useRouter();
  async function submit(e) {
    e.preventDefault(); setMsg("");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setMsg("รูปแบบอีเมลไม่ถูกต้อง");
    if (password.length < 6) return setMsg("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
    const { error } = up ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMsg(error.message);
    if (up) setMsg("สมัครสำเร็จ (ถ้าเปิดยืนยันอีเมล โปรดตรวจอีเมล) แล้วเข้าสู่ระบบ"); else router.replace("/");
  }
  return (
    <form onSubmit={submit} className="mx-auto mt-24 w-80 space-y-3 rounded bg-white p-6 shadow">
      <h1 className="text-lg font-bold">{up ? "Sign up" : "Login"}</h1>
      <input className="inp" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="inp" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <button className="btn w-full">{up ? "Sign up" : "Login"}</button>
      <button type="button" className="text-xs text-blue-600" onClick={() => setUp(!up)}>{up ? "มีบัญชีแล้ว? Login" : "สมัครใหม่ (Technician)"}</button>
    </form>);
}
