import "../index.scss";
import { I18nProvider } from "./i18n/i18n-context";
import { detectLanguage } from "./i18n/server";

export async function generateMetadata() {
  // fetch data
  const themeOption = await fetch(`${process.env.API_PROD_URL}/themeOptions`)
    .then((res) => res.json())
    .catch((err) => console.log("err", err));
  return {
    metadataBase: new URL(process.env.API_PROD_URL),
    title: "NammaKadai Bharathi Silks",
    description: themeOption?.options?.seo?.meta_description,
    icons: {
      icon: "/assets/images/icon/logo/nammakadai/Namma%20Kadai%20Logo.png",
      link: {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Yellowtail&display=swap",
      },
    },
    openGraph: {
      title: themeOption?.options?.seo?.og_title,
      description: themeOption?.options?.seo?.og_description,
      images: [themeOption?.options?.seo?.og_image?.original_url, []],
    },
  };
}

export default async function RootLayout({ children }) {
  // const settings = await fetch(`${process.env.API_PROD_URL}/settings`)
  //   .then((res) => res.json())
  //   .catch((err) => {
  //     return err;
  //   });
  const lng = await detectLanguage();
  return (
    <I18nProvider language={lng}>
      <html lang="en" data-scroll-behavior="smooth">
        <head>
          {/* Global font */}
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Yellowtail&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Cormorant:wght@400;500;600;700&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Recursive:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Courgette&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        </head>
        <body suppressHydrationWarning={true}>{children}</body>
      </html>
    </I18nProvider>
  );
}
