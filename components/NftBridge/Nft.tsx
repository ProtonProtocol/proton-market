import { useState, useEffect } from 'react';
import { ETH_ASSET, NFT_ATTR, getNftMetadata } from '../../services/ethereum';
import { Asset } from '../../services/assets';
import { NftName, NftItem } from './NftBridge.styled';
import { Image } from '../../styles/index.styled';

interface EthNftProps {
  data: ETH_ASSET;
  selectedNft?: ETH_ASSET;
  setSelectedNft?: (nft: ETH_ASSET) => void;
  removeSelectedNft?: (nft: ETH_ASSET) => void;
}

export const EthNft = (props: EthNftProps): JSX.Element => {
  const [attributes, setAttributes] = useState<NFT_ATTR>();

  useEffect(() => {
    if (props?.data.attributes.name) {
      setAttributes(props.data.attributes);
    } else if (props.data.tokenUri) {
      getNftMetadata(props.data.tokenUri).then((attr) => {
        setAttributes(attr);
      });
    }
  }, [props?.data.tokenUri]);

  return (
    <NftItem
      selected={
        props.selectedNft?.contractAddress == props.data.contractAddress &&
        props.selectedNft?.tokenId == props.data.tokenId
      }>
      <Image
        src={attributes?.image}
        width="48"
        height="48"
        style={{ marginRight: 20, borderRadius: 4, cursor: 'pointer' }}
        onClick={() => props.setSelectedNft && props.setSelectedNft(props.data)}
      />
      <NftName>{attributes?.name}</NftName>
      <Image
        style={{
          width: '24px',
          height: '24px',
          margin: '0 10px',
          cursor: 'pointer',
        }}
        src="/close.svg"
        color="#752EEB"
        onClick={() =>
          props.removeSelectedNft && props.removeSelectedNft(props.data)
        }
      />
    </NftItem>
  );
};

interface ProtonNftProps {
  data: Asset;
  selectedNft?: Asset;
  setSelectedNft?: (nft: Asset) => void;
  removeSelectedNft?: (nft: Asset) => void;
}

export const ProtonNft = (props: ProtonNftProps): JSX.Element => {
  const [attributes, setAttributes] = useState<NFT_ATTR>();

  useEffect(() => {
    if (props.data.data.token_uri) {
      getNftMetadata(props.data.data.token_uri as string).then((attr) => {
        setAttributes(attr);
      });
    }
  }, [props?.data.data.token_uri]);

  return (
    <NftItem selected={props.selectedNft?.asset_id == props.data.asset_id}>
      <Image
        src={attributes?.image}
        width="50"
        height="50"
        style={{ marginRight: 20, borderRadius: 4, cursor: 'pointer' }}
        onClick={() => props.setSelectedNft && props.setSelectedNft(props.data)}
      />
      <NftName>{attributes?.name}</NftName>
      <Image
        style={{
          width: '24px',
          height: '24px',
          margin: '0 10px',
          cursor: 'pointer',
        }}
        src="/close.svg"
        color="#752EEB"
        onClick={() =>
          props.removeSelectedNft && props.removeSelectedNft(props.data)
        }
      />
    </NftItem>
  );
};
