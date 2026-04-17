import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SeoHead from "../components/SeoHead";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (!data.user) { router.push("/login"); return; }
      setUser(data.user);
    } catch (e) { router.push("/login"); }
    finally { setLoading(false); }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "DELETE" });
    router.push("/");
  }

  if (loading) return (<><SeoHead title="Account"/><Nav/><main style={{padding:"2rem"}}>Loading...</main><Footer/></>);

  if (!user) return null;

  return (
    <>
      <SeoHead title="My Account - SharonCraft" path="/account"/>
      <Nav />
      <main>
        <div style={{maxWidth:500,margin:"0 auto",padding:"2rem"}}>
          <h1 style={{fontSize:"1.5rem",marginBottom:"1.5rem"}}>My Account</h1>
          <div style={{background:"#fff",padding:"1.5rem",borderRadius:8,border:"1px solid #e5e5e5"}}>
            <p style={{fontSize:"0.875rem",color:"#666",marginBottom:"0.5rem"}}>Email</p>
            <p style={{marginBottom:"1.5rem"}}>{user.email}</p>
            <a href="/wishlist" style={{color:"#C04D29",fontWeight:500}}>My Wishlist</a>
          </div>
          <button onClick={handleLogout} style={{marginTop:"1.5rem",padding:"0.75rem 1.5rem",background:"transparent",border:"1px solid #e5e5e5",borderRadius:6,cursor:"pointer"}}>Logout</button>
        </div>
      </main>
      <Footer />
    </>
  );
}
