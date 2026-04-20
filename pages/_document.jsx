import Document, { Head, Html, Main, NextScript } from "next/document";
import { readSiteImages } from "../lib/site-images";

export default class SharonCraftDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    let pageTexture = "/textures/linen-noise.svg";
    try {
      const imgs = await readSiteImages();
      if (imgs.pageTexture) pageTexture = imgs.pageTexture;
    } catch {
      /* keep default */
    }
    return { ...initialProps, pageTexture };
  }

  render() {
    const { pageTexture } = this.props;
    return (
      <Html lang="en">
        <Head>
          <meta name="theme-color" content="#D32F2F" />
          <meta name="msapplication-TileColor" content="#D32F2F" />
          
          {/* Modern favicon support */}
          <link rel="icon" href="/favicon-32x32.png?v=1" sizes="32x32" type="image/png" />
          <link rel="icon" href="/favicon-16x16.png?v=1" sizes="16x16" type="image/png" />
          <link rel="shortcut icon" href="/favicon-32x32.png?v=1" type="image/png" />
          <link rel="icon" href="/favicon.ico" type="image/x-icon" />
          
          {/* Apple touch icon for iOS home screen */}
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          
          {/* Web app manifest */}
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body
          style={{
            backgroundImage: `url('${pageTexture}')`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        >
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
