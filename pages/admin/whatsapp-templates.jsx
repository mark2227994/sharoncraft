import { isAuthorizedRequest } from "../../lib/admin-auth";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import SeoHead from "../../components/SeoHead";
import WhatsAppTemplateManager from "../../components/admin/WhatsAppTemplateManager";

export async function getServerSideProps(context) {
  const authorized = isAuthorizedRequest(context.req);
  
  if (!authorized) {
    return {
      redirect: {
        destination: "/admin",
        permanent: false,
      },
    };
  }

  return { props: {} };
}

export default function AdminWhatsAppTemplatesPage() {
  return (
    <>
      <SeoHead
        title="WhatsApp Templates | SharonCraft Admin"
        description="Message templates for customer communication via WhatsApp"
        path="/admin/whatsapp-templates"
      />
      <Nav />
      <main style={{ minHeight: "100vh", paddingBottom: "60px" }}>
        <WhatsAppTemplateManager />
      </main>
      <Footer />
    </>
  );
}
