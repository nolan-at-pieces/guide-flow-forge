
import Layout from "@/components/layout";
import DocNotFound from "@/components/doc-not-found";

const NotFound = () => {
  return (
    <Layout>
      <DocNotFound 
        title="Page Not Found"
        description="Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or the URL might be incorrect."
        showBackButton={true}
      />
    </Layout>
  );
};

export default NotFound;
