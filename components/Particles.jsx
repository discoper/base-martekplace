import React, { useEffect } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.scss";
function Particles() {
  return (
    <>
      <div id="particles-js" className={styles.particles}></div>
      <div className="count-particles">
        <span className="js-count-particles"></span> particles
      </div>
    </>
  );
}

export default Particles;
