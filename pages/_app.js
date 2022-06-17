import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../styles/globals.scss";
import styles from "../styles/Home.module.scss";
import "../public/particles/css/style.css";
import "../public/particles/css/particles.css";
import { BlockchainContext } from "../context/BlockChainContext";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const app = () => {
      const script = document.createElement("script");
      script.src = "/particles/js/app.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    };
    return app();
  }, []);
  return (
    <>
      <div>
        <BlockchainContext>
          <Navbar />
          <div className={styles.jumbotron}>
            <Particles />
            <Component {...pageProps} />
          </div>
        </BlockchainContext>
      </div>
    </>
  );
}

export default MyApp;
