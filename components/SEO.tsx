import Head from "next/head";

type SEOProps = {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
};

export default function SEO({
  title = "NexaPay",
  description = "Simplify payments, automate transactions, and integrate smarter.",
  keywords = "payments, fintech, API, developers, NexaPay, Nigeria, automation",
  canonical = "https://nexapay.app",
  image = "/logo.png",
}: SEOProps) {
  return (
    <Head>
      {/* Basic Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Social Meta */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
