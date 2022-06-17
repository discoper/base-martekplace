import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useBlockChainContext } from "../context/BlockChainContext";
import styles from "../styles/Home.module.scss";

export default function MyAssets() {
  const { contract, provider } = useBlockChainContext();
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const router = useRouter();
  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    if (!provider) return;
    try {
      const data = await contract
        .connect(await provider.getSigner())
        .fetchMyNFTs();
      console.log(data);

      const items = await Promise.all(
        data.map(async (i) => {
          const tokenURI = await contract.tokenURI(i.tokenId);
          console.log(tokenURI);
          const meta = await axios.get(tokenURI);
          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
            tokenURI,
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
  function listNFT(nft) {
    console.log("nft:", nft);
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`);
  }
  if ((loadingState === "loaded" && !nfts.length) || !provider)
    return (
      <div className={styles.elementContainer}>
        <h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>
      </div>
    );
  return (
    <div className={styles.elementContainer}>
      <div className="flex justify-center">
        <div className="p-4">
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
                    onClick={() => listNFT(nft)}
                    className={styles.primaryButton}
                  >
                    List
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
