import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import { useBlockChainContext } from "../context/BlockChainContext";
import styles from "../styles/Home.module.scss";
export default function CreatorDashboard() {
  const { contract, provider } = useBlockChainContext();
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, [provider]);
  async function loadNFTs() {
    if (!provider) return;
    try {
      const data = await contract.fetchItemsListed();

      const items = await Promise.all(
        data.map(async (i) => {
          const tokenUri = await contract.tokenURI(i.tokenId);
          const meta = await axios.get(tokenUri);
          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
            description: meta.data.description,
          };
          return item;
        })
      );

      setNfts(items);
      setLoadingState("loaded");
    } catch (err) {
      alert("Algo salio mal");
      console.log(err);
    }
  }
  if ((loadingState === "loaded" && !nfts.length) || !provider)
    return (
      <div className={styles.elementContainer}>
        <h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>
      </div>
    );
  return (
    <div className={styles.elementContainer}>
      <div>
        <div className="p-4">
          {/* <h2 className="text-2xl py-2">Items Listed</h2> */}
          <div className={styles.nftGrid}>
            {nfts.map((nft, i) => (
              <div
                key={i}
                className={`border shadow rounded-xl overflow-hidden ${styles.nft}`}
              >
                <div className={styles.nftImageWrapper}>
                  <img src={nft.image} />
                </div>
                <div className={styles.titleNDesc}>
                  <h1>{nft.name}</h1>
                  <h4>{nft.price}</h4>
                  <p className={styles.description}>{nft.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
