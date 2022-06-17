import React, { useContext, useEffect, useState } from "react";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers, providers } from "ethers";
import { marketplaceAddress } from "../config";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
const BCContext = React.createContext();

export function useBlockChainContext() {
  return useContext(BCContext);
}

export function BlockchainContext({ children }) {
  //Setting Variables
  const [account, setAccount] = useState();
  const [instance, setInstance] = useState();
  const [provider, setProvider] = useState();
  const [message, setMessage] = useState();
  const [contract, setContract] = useState();
  //Set user in web3Modal
  const providerOptions = {
    metamask: {
      id: "injected",
      name: "MetaMask",
      type: "injected",
      check: "isMetaMask",
    },
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "04bfa7d48b3e4d0e87bf5c8c7e15b4c3", // Required
        network: "ropsten",
        qrcodeModalOptions: {
          mobileLinks: [
            "rainbow",
            "metamask",
            "argent",
            "trust",
            "imtoken",
            "pillar",
          ],
        },
      },
    },
    theme: "dark",
  };

  //Connect to user's wallet
  const connectWeb3Modal = async () => {
    try {
      const web3Modal = new Web3Modal({
        providerOptions,
      });
      web3Modal.clearCachedProvider();
      const instance = await web3Modal.connect();
      const provider = await new ethers.providers.Web3Provider(instance);
      const contract = await new ethers.Contract(
        marketplaceAddress,
        NFTMarketplace.abi,
        await provider.getSigner()
      );
      setContract(await contract.connect(await provider.getSigner()));
      setInstance(instance);
      setProvider(provider);
      setAccount(await provider.getSigner().getAddress());
    } catch (err) {
      setMessage("Please Connect your wallet");
      console.log(err);
    }
  };

  //Update user's metamask network
  const updateNet = (id) => {
    if (id !== 3) {
      setMessage("Red Equivocada Conectate a la red de Ropsten");
      throw "Unknown Network";
    }
  };

  const checkForWeb3 = () => {
    if (!provider) {
      setMessage("Please connect a wallet");
      return false;
    }
    return true;
  };
  useEffect(() => {
    const init = async () => {
      if (instance) {
        //When User Changes Accounts
        instance.on("accountsChanged", async (account) => {
          if (account.length == 0) {
            setAccount("");
            return setMessage("Please connect your wallet");
          }
          const provider = await new providers.Web3Provider(instance);
          setAccount(await provider.getSigner().getAddress());
          setProvider(provider);
        });

        //When User Changes Chain
        instance.on("chainChanged", async (chainId) => {
          try {
            setProvider(await new ethers.providers.Web3Provider(instance));
            updateNet(chainId);
          } catch (err) {
            console.log(err);
          }
        });
        if (provider._network) updateNet(provider._network.chainId);
      }
    };
    init();
  }, [instance]);
  return (
    <BCContext.Provider
      value={{
        connectWeb3Modal,
        provider,
        account,
        updateNet,
        setMessage,
        checkForWeb3,
        contract,
      }}
    >
      {children}
      {message && <Modal message={message} setMessage={setMessage} />}
    </BCContext.Provider>
  );
}

const Modal = ({ message, setMessage }) => {
  const [animation, setAnimation] = useState(false);
  const goBack = () => {
    setTimeout(() => {
      setMessage("");
    }, 400);
  };
  useEffect(() => {
    if (message) {
      setTimeout(() => {
        setAnimation(true);
        goBack();
      }, 3000);
    }
  }, [message]);

  return (
    <>
      <div key={message} className={`modal ${animation ? "go-back" : "go-in"}`}>
        {message}
      </div>
    </>
  );
};
