import React from "react";
import { useBlockChainContext } from "../context/BlockChainContext";
import Link from "next/link";
import logo from "../public/HorzLogo.png";

import styles from "../styles/Home.module.scss";
function Navbar() {
  const { account, connectWeb3Modal } = useBlockChainContext();
  return (
    <div>
      <nav className={`border-b p-6 ${styles.navbar}`}>
        {/* <p className="text-4xl font-bold">Metaverse Marketplace</p> */}
        <Link href="/">
          <img src={logo.src} className={styles.logoNav} alt="" srcSet="" />
        </Link>

        <div className={`flex ${styles.linkContainer}`}>
          <Link href="https://discoper.io/">
            <a className="mr-4 text-pink-500">Home</a>
          </Link>
          <Link href="/create-nft">
            <a className="mr-6 text-pink-500">Create NFT</a>
          </Link>
          <Link href="/my-nfts">
            <a className="mr-6 text-pink-500">My NFTs</a>
          </Link>
          <Link href="/dashboard">
            <a className="mr-6 text-pink-500">Dashboard</a>
          </Link>
          <div className="buttons" onClick={connectWeb3Modal}>
            <button className={styles.primaryButton}>
              {account ? account : "Connect Wallet"}
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
