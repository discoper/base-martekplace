import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import { useBlockChainContext } from "../context/BlockChainContext";
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
import styles from "../styles/Home.module.scss";

export default function CreateItem() {
  const { contract, provider } = useBlockChainContext();
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function uploadToIPFS() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      return url;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function listNFTForSale() {
    try {
      const url = await uploadToIPFS();
      /* next, create the item */
      const price = ethers.utils.parseUnits(formInput.price, "ether");
      let listingPrice = await contract.getListingPrice();
      listingPrice = listingPrice.toString();
      let transaction = await contract
        .connect(await provider.getSigner())
        .createToken(url, price, {
          value: listingPrice,
        })
        .send({ from: await provider.getSigner().getAddress() });
      await transaction.wait();

      router.push("/");
    } catch (err) {
      alert("Algo salio mal");
      console.log(err);
    }
  }

  return (
    <div className={styles.elementContainer}>
      <input
        placeholder="Asset Name"
        className="mt-8 border rounded p-4"
        onChange={(e) =>
          updateFormInput({ ...formInput, name: e.target.value })
        }
      />
      <textarea
        placeholder="Asset Description"
        className="mt-2 border rounded p-4"
        onChange={(e) =>
          updateFormInput({ ...formInput, description: e.target.value })
        }
      />
      <input
        placeholder="Asset Price in Eth"
        className="mt-2 border rounded p-4"
        onChange={(e) =>
          updateFormInput({ ...formInput, price: e.target.value })
        }
      />
      <input type="file" name="Asset" className="my-4" onChange={onChange} />
      {fileUrl && (
        <img
          className={`${styles.createNftImage}rounded mt-4`}
          width="350"
          src={fileUrl}
        />
      )}
      <button onClick={listNFTForSale} className={styles.primaryButton}>
        Create NFT
      </button>
    </div>
  );
}
