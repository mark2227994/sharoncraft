export async function getServerSideProps({ params }) {
  return {
    redirect: {
      destination: `/blog/${params.slug}`,
      permanent: true,
    },
  };
}

export default function JournalArticleRedirect() {
  return null;
}
