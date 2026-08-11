export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/blog",
      permanent: true,
    },
  };
}

export default function JournalRedirect() {
  return null;
}
