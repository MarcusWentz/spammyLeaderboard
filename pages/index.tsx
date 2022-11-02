import React from 'react';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { abi } from '../contract-abi';
import FlipCard, { BackCard, FrontCard } from '../components/FlipCard';

const contractConfig = {
  address: '0xEb9322b1e1268e8A4e35C2e37041740296908bfb',
  abi,
};

const Home: NextPage = () => {

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [totalMinted, setTotalMinted] = React.useState(0);
  const { isConnected } = useAccount();

  const { config: contractWriteConfig } = usePrepareContractWrite({
    ...contractConfig,
    functionName: 'mint',
  });

  const {
    data: mintData,
    write: mint,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useContractWrite(contractWriteConfig);

  const { data: totalSupplyData } = useContractRead({
    ...contractConfig,
    functionName: 'totalSupply',
    watch: true,
  });

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  React.useEffect(() => {
    if (totalSupplyData) {
      setTotalMinted(totalSupplyData.toNumber());
    }
  }, [totalSupplyData]);

  const isMinted = txSuccess;

  return (
    <div className="page">
      <div className="container">
        <div style={{ flex: '24 24 auto' }}>
          <div style={{ padding: '0px 0px 0px 0' , color: '#FFFFFF'}}>
            <h1>Spam NFT</h1>
            <p style={{ margin: '0px 0 0px', color: '#FFFFFF' }}>
              {totalMinted} minted spam
            </p>
            <p style={{ margin: '0px 0 0px', color: '#FFFFFF' }}>
              {totalMinted} minted spam
            </p>
            <ConnectButton />

            {mintError && (
              <p style={{ marginTop: 24, color: '#FF6257' }}>
                Error: {mintError.message}
              </p>
            )}
            {txError && (
              <p style={{ marginTop: 24, color: '#FF6257' }}>
                Error: {txError.message}
              </p>
            )}

            {mounted && isConnected && !isMinted && (
              <button
                style={{ marginTop: 24 }}
                disabled={!mint || isMintLoading || isMintStarted}
                className="button"
                data-mint-loading={isMintLoading}
                data-mint-started={isMintStarted}
                onClick={() => mint?.()}
              >
                {isMintLoading && 'Waiting for approval'}
                {isMintStarted && 'Minting...'}
                {!isMintLoading && !isMintStarted && 'Mint'}
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: '24 24 auto' }}>
         <FlipCard>
           <FrontCard isCardFlipped={isMinted}>
             <Image
               layout="responsive"
               src="/nft.png"
               width="500"
               height="500"
               alt="RainbowKit Demo NFT"
             />
             <h1 style={{ marginTop: 24 }}>Rainbow NFT</h1>
             <ConnectButton />
           </FrontCard>
           <BackCard isCardFlipped={isMinted}>
             <div style={{ padding: 24 }}>
               <Image
                 src="/nft.png"
                 width="80"
                 height="80"
                 alt="RainbowKit Demo NFT"
                 style={{ borderRadius: 8 }}
               />
               <h2 style={{ marginTop: 24, marginBottom: 6 }}>NFT Minted!</h2>
               <p style={{ marginBottom: 24 }}>
                 Your NFT will show up in your wallet in the next few minutes.
               </p>
               <p style={{ marginBottom: 6 }}>
                 View on{' '}
                 <a href={`https://explorer-liberty20.shardeum.org/transaction/${mintData?.hash}`}>
                   Shardeum Explorer
                 </a>
               </p>
             </div>
           </BackCard>
         </FlipCard>
       </div>

      </div>
    </div>
  );
};

export default Home;
