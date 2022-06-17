import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import axios from "axios";
import { useBlockChainContext } from "../context/BlockChainContext";
import styles from "../styles/Home.module.scss";

export default function ResellNFT() {
  const { contract, provider } = useBlockChainContext();
  const [formInput, updateFormInput] = useState({ price: "", image: "" });
  const router = useRouter();
  const { id, tokenURI } = router.query;
  const { image, price } = formInput;

  useEffect(() => {
    fetchNFT();
  }, [id, provider]);

  async function fetchNFT() {
    if (!tokenURI) return;
    const meta = await axios.get(tokenURI);
    updateFormInput((state) => ({ ...state, image: meta.data.image }));
  }

  async function listNFTForSale() {
    if (!provider) return;
    try {
      if (!price) return;

      const priceFormatted = ethers.utils.parseUnits(formInput.price, "ether");

      let listingPrice = await contract.getListingPrice();

      listingPrice = listingPrice.toString();
      let transaction = await contract.resellToken(id, priceFormatted, {
        value: listingPrice,
      });
      await transaction.wait();

      router.push("/");
    } catch (err) {
      alert("Algo salio mal");
      console.log(err);
    }
  }

  return (
    <div
      className={`flex flex-direction-column justify-center ${styles.elementContainer}`}
    >
      <input
        placeholder="Asset Price in Eth"
        className="mt-2 border rounded p-4"
        onChange={(e) =>
          updateFormInput({ ...formInput, price: e.target.value })
        }
      />
      {image && <img className="rounded mt-4" width="350" src={image} />}
      <button onClick={() => listNFTForSale()} className={styles.primaryButton}>
        List NFT
      </button>
    </div>
  );
}
