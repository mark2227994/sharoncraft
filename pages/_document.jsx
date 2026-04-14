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
          <meta name="theme-color" content="#F9F6EE" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="shortcut icon" href="/favicon.svg" />
          <link rel="apple-touch-icon" href="/favicon.svg" />
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
