import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import { useBlockChainContext } from "../context/BlockChainContext";
import styles from "../styles/Home.module.scss";
export default function Home() {
  const { contract, provider } = useBlockChainContext();
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    if (provider) loadNFTs();
  }, [provider]);
  async function loadNFTs() {
    if (!provider) return;
    try {
      /* create a generic provider and query for unsold market items */
      const data = await contract.fetchMarketItems();
      /*
       *  map over items returned from smart contract and format
       *  them as well as fetch their token metadata
       */
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
            name: meta.data.name,
            description: meta.data.description,
          };
          return item;
        })
      );
      setNfts(items);
      setLoadingState("loaded");
    } catch (err) {
      alert("Algo salio mal");
    }
  }
  async function buyNft(nft) {
    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    });
    await transaction.wait();
    loadNFTs();
  }
  if ((loadingState === "loaded" && !nfts.length) || !provider)
    return (
      <div className={styles.elementContainer}>
        <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>
      </div>
    );
  return (
    <div className={`flex justify-center ${styles.elementContainer}`}>
      <div style={{ maxWidth: "1600px" }}>
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
                <button
                  onClick={() => buyNft(nft)}
                  className={styles.primaryButton}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
