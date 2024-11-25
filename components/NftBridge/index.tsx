import { useState, useEffect, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useToasts } from 'react-toast-notifications';
import {
  Header,
  HeaderTitle,
  SubTitle,
  ContentHeader,
  Container,
  Content,
  Switch,
  ChainBtn,
  MessageBox,
  NftBox,
  TabContainer,
  Tabs,
  Tab,
  AddNFTBtn,
  TransferBtn,
  NoNFTBox,
  Row,
  PlusIcon,
  SwitchIcon,
  TransferFee,
} from './NftBridge.styled';
import { Image } from '../../styles/index.styled';
import InputField from '../InputField';
import Button from '../Button';
import {
  ETH_ASSET,
  transferERC721ToBridge,
  transferERC1155ToBridge,
  NftType,
  approvedNFT,
} from '../../services/ethereum';
import protonSDK from '../../services/proton';
import proton, {
  TeleportFees,
  TeleportFeesBalance,
} from '../../services/proton-rpc';
import { Asset } from '../../services/assets';
import Spinner from '../Spinner';
import { useAuthContext } from '../Provider';
import { EthNft, ProtonNft } from './Nft';
import { useModalContext, MODAL_TYPES } from '../Provider';
import { TrackingTables } from './TrackingTables';
import { displayNumberAsAmount } from '@bloks/numbers';

const TRANSFER_DIR = {
  ETH_TO_PROTON: 'ETH_TO_PROTON',
  PROTON_TO_ETH: 'PROTON_TO_ETH',
};

const NftBridge = (): JSX.Element => {
  const { addToast } = useToasts();
  const { currentUser } = useAuthContext();
  const { openModal, setModalProps } = useModalContext();

  const { library, account, active, deactivate, chainId } = useWeb3React();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transDir, setTransDir] = useState<string>(TRANSFER_DIR.ETH_TO_PROTON);
  const [advancedAddr, setAdvancedAddr] = useState<string>('');
  const [ethAssetsToSend, setEthAssetsToSend] = useState<ETH_ASSET[]>([]);
  const [protonAssetsToSend, setProtonAssetsToSend] = useState<Asset[]>([]);
  const [nftType, setNftType] = useState<NftType>(NftType.ERC_721);
  const [teleportFees, setTeleportFees] = useState<TeleportFees[]>([]);
  const [feesBalance, setFeesBalance] = useState<TeleportFeesBalance>({
    owner: '',
    balance: 0,
    reserved: 0,
  });

  useEffect(() => {
    (async () => {
      const fees = await proton.getTeleportFees();
      setTeleportFees(fees);
    })();
  }, []);

  useEffect(() => {
    if (currentUser?.actor) {
      proton.getFeesBalanceForTeleport(currentUser.actor).then((balance) => {
        setFeesBalance(balance);
      });
    }
  }, [currentUser?.actor]);

  useEffect(() => {
    if (!account) {
      setAdvancedAddr('');
    }
  }, [account]);

  const filteredFees = useMemo(() => {
    if (!teleportFees.length) {
      return {
        chain_id: -1,
        port_in_fee: 0,
        port_out_fee: 0,
      };
    }

    const defaultChainId = chainId ? chainId : 137;

    const fees = teleportFees.find((el) => el.chain_id == defaultChainId);
    if (fees) {
      return fees;
    } else {
      // return default fees
      const defaultFee = teleportFees.find((el) => el.chain_id == 0);
      if (defaultFee) {
        return defaultFee;
      }

      return {
        chain_id: -1,
        port_in_fee: 0,
        port_out_fee: 0,
      };
    }
  }, [chainId, teleportFees]);

  const transferFee = useMemo(() => {
    let feeAmount = 0;
    if (transDir == TRANSFER_DIR.PROTON_TO_ETH) {
      feeAmount = filteredFees.port_out_fee;
    } else {
      feeAmount = filteredFees.port_in_fee;
    }
    return feeAmount;
  }, [transDir, filteredFees]);

  const disconnectWallet = () => {
    if (active) {
      deactivate();
      localStorage.clear();
      setNftType(
        transDir === TRANSFER_DIR.ETH_TO_PROTON
          ? NftType.ERC_721
          : NftType.ATOMIC
      );
      return;
    }
  };

  const setSelectedNfts = (nft: Asset | ETH_ASSET) => {
    if (!nft) return;

    if (transDir === TRANSFER_DIR.ETH_TO_PROTON) {
      const assets = ethAssetsToSend;
      assets.push(nft as ETH_ASSET);
      setEthAssetsToSend(assets);
    } else {
      const assets = protonAssetsToSend;
      assets.push(nft as Asset);
      setProtonAssetsToSend(assets);
    }
  };

  const removeSelectedNft = (nft: Asset | ETH_ASSET) => {
    if (!nft) return;

    if (nftType == NftType.ERC_721 || nftType == NftType.ERC_1155) {
      const assets = ethAssetsToSend.filter(
        (_) => _.tokenId != (nft as ETH_ASSET).tokenId
      );
      setEthAssetsToSend(assets);
    } else if (nftType == NftType.ATOMIC) {
      const assets = protonAssetsToSend.filter(
        (_) => _.asset_id != (nft as Asset).asset_id
      );
      setProtonAssetsToSend(assets);
    }
  };

  const openAssetsModal = () => {
    if (transDir === TRANSFER_DIR.ETH_TO_PROTON && !account) {
      addToast('Please connect Ethereum wallet.', {
        appearance: 'warning',
        autoDismiss: true,
      });
      return;
    }

    if (transDir === TRANSFER_DIR.PROTON_TO_ETH && !currentUser?.actor) {
      addToast('Please connect Webauth.com wallet.', {
        appearance: 'warning',
        autoDismiss: true,
      });
      return;
    }

    setModalProps((previousModalProps) => ({
      ...previousModalProps,
      ethToProton: transDir === TRANSFER_DIR.ETH_TO_PROTON,
      owner:
        transDir === TRANSFER_DIR.ETH_TO_PROTON ? account : currentUser.actor,
      nftType: nftType,
      selectedNfts: ethAssetsToSend,
      setSelectedNfts: setSelectedNfts,
    }));
    openModal(MODAL_TYPES.SELECT_ASSETS);
  };

  const clearSelectedNfts = async () => {
    setEthAssetsToSend([]);
    setProtonAssetsToSend([]);
  };

  const checkFeesBalance = () => {
    if (filteredFees.chain_id < 0) {
      return false;
    }

    if (transDir === TRANSFER_DIR.ETH_TO_PROTON) {
      if (filteredFees.port_in_fee == 0) {
        return true;
      }
      return (
        feesBalance.balance - feesBalance.reserved >= filteredFees.port_in_fee
      );
    } else {
      if (filteredFees.port_out_fee == 0) {
        return true;
      }
      return (
        feesBalance.balance - feesBalance.reserved >= filteredFees.port_out_fee
      );
    }
  };

  const topUpTransferFee = async () => {
    const res = await protonSDK.topUpTeleportFee(transferFee);
    if (res.success) {
      if (currentUser?.actor) {
        proton.getFeesBalanceForTeleport(currentUser.actor).then((balance) => {
          setFeesBalance(balance);
        });
      }
    } else {
      addToast(res.error, { appearance: 'error', autoDismiss: true });
    }
  };

  const handleTransfer = async () => {
    if (!teleportFees.length || !feesBalance) {
      addToast('Refresh the page!', {
        appearance: 'warning',
        autoDismiss: true,
      });
      return;
    }

    if (!checkFeesBalance()) {
      setModalProps((previousModalProps) => ({
        ...previousModalProps,
        fee: transferFee,
        fetchPageData: topUpTransferFee,
      }));
      openModal(MODAL_TYPES.TOP_UP);
      return;
    }

    try {
      if (transDir === TRANSFER_DIR.ETH_TO_PROTON) {
        if (!library) {
          addToast('Please connect ethereum wallet.', {
            appearance: 'info',
            autoDismiss: true,
          });
          return;
        }

        if (!ethAssetsToSend.length) {
          addToast('Please select NFTs to send.', {
            appearance: 'info',
            autoDismiss: true,
          });
          return;
        }

        const tokenIds = ethAssetsToSend.map((nft: ETH_ASSET) => nft.tokenId);
        const tokenContract = ethAssetsToSend[0].contractAddress;
        setIsLoading(true);

        // check if selected NFT is approved
        const [isApproved, templates] = await Promise.all([
          approvedNFT(tokenContract, library.getSigner()),
          proton.getTemplatesRegisteredInBridge(),
        ]);
        const index = templates.findIndex(
          (_) =>
            _.contract_address?.toLowerCase() ==
            tokenContract.substring(2).toLowerCase()
        );
        if (!isApproved || index < 0) {
          addToast(
            `Selected NFTs are not approved. Please contact developers (${tokenContract})`,
            {
              appearance: 'info',
              autoDismiss: true,
            }
          );
          setIsLoading(false);
          return;
        }

        if (nftType == NftType.ERC_721) {
          const txPreHash = await transferERC721ToBridge(
            tokenContract,
            tokenIds[0],
            account,
            library.getSigner()
          );
          await txPreHash.wait();
        } else {
          const txPreHash = await transferERC1155ToBridge(
            tokenContract,
            tokenIds,
            account,
            ethAssetsToSend.map((_) => 1),
            library.getSigner()
          );
          await txPreHash.wait();
        }

        // Clear
        setEthAssetsToSend([]);

        addToast('Transfered to Ethereum NFT Bridge successfully.', {
          appearance: 'success',
          autoDismiss: true,
        });

        setTimeout(() => {
          setModalProps((previousModalProps) => ({
            ...previousModalProps,
            ethToProton: true,
            receiver: advancedAddr == '' ? currentUser.actor : advancedAddr,
            tokenContract,
            tokenIds: tokenIds,
            fetchPageData: clearSelectedNfts,
          }));
          openModal(MODAL_TYPES.CONFIRM_TELEPORT);
        }, 1000);

        setIsLoading(false);
      } else {
        if (!account && advancedAddr == '') {
          addToast(
            "Please connect ethereum wallet or enter recipient's address.",
            { appearance: 'info', autoDismiss: true }
          );
          return;
        }

        if (!protonAssetsToSend.length) {
          addToast('Please select NFTs to send.', {
            appearance: 'info',
            autoDismiss: true,
          });
          return;
        }

        setIsLoading(true);

        // Transfer
        const transferRes = await protonSDK.transfer({
          sender: currentUser?.actor,
          recipient: process.env.NEXT_PUBLIC_PRT_NFT_BRIDGE,
          asset_ids: protonAssetsToSend.map((asset) => asset.asset_id),
          memo: 'Transfer NFTs to teleport',
        });

        if (!transferRes.success) {
          addToast('Transfer failed.', {
            appearance: 'error',
            autoDismiss: true,
          });
          setIsLoading(false);
          return;
        }

        // Clear
        setProtonAssetsToSend([]);

        addToast('Transfered NFTs to PRTBRIDGE', {
          appearance: 'success',
          autoDismiss: true,
        });

        setTimeout(() => {
          let tokenContract = '0x';
          (protonAssetsToSend[0].data.contract_address as number[]).forEach(
            (el) => {
              tokenContract += el.toString(16);
            }
          );

          let tokenId = '0x';
          (protonAssetsToSend[0].data.token_id as number[]).forEach((el) => {
            tokenId += el.toString(16);
          });

          setModalProps((previousModalProps) => ({
            ...previousModalProps,
            ethToProton: false,
            receiver: advancedAddr == '' ? account : advancedAddr,
            tokenContract,
            tokenId,
            assetIds: protonAssetsToSend.map((_) => _.asset_id),
            fetchPageData: clearSelectedNfts,
          }));
          openModal(MODAL_TYPES.CONFIRM_TELEPORT);
        }, 1000);

        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e);
    }
  };

  return (
    <>
      <Container>
        <Header>
          <HeaderTitle>NFT Bridge</HeaderTitle>
          <SubTitle>
            The NFT bridge allows a user transfer their NFT assets between
            Ethereum blockchain and Proton.
          </SubTitle>
        </Header>

        <Content>
          <ContentHeader>Transfer NFTs</ContentHeader>
          <MessageBox>
            <div style={{ margin: '0 0 24px' }}>
              {account ? (
                <Row>
                  <div style={{ whiteSpace: 'nowrap', marginRight: 10 }}>
                    Connected Wallet
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <div
                      style={{
                        marginRight: 20,
                        wordBreak: 'break-all',
                        textAlign: 'left',
                      }}>
                      {account}
                    </div>
                    <Image
                      width="24px"
                      height="24px"
                      src="/close.svg"
                      color="#752EEB"
                      onClick={() => disconnectWallet()}
                    />
                  </div>
                </Row>
              ) : (
                <div>
                  Click on the button below to connect to your Ethereum wallet.
                </div>
              )}
            </div>

            {!account && (
              <Button
                smallSize={true}
                margin="0 0 16px"
                onClick={() => openModal(MODAL_TYPES.SELECT_WALLET)}>
                Connect Wallet
              </Button>
            )}

            <Row>
              <div style={{ whiteSpace: 'nowrap', margin: '-6px 10px 0 0' }}>
                Receive Address
              </div>
              <div style={{ marginTop: 5, flex: 1 }}>
                <InputField
                  value={advancedAddr}
                  setValue={setAdvancedAddr}
                  placeholder="Enter Address (optional)"
                />
                <p style={{ fontSize: 12, textAlign: 'left' }}>
                  Note: leave empty for transferring NFTs between your wallets{' '}
                </p>
              </div>
            </Row>
          </MessageBox>

          <Switch>
            <span style={{ order: 1 }}>From</span>
            <ChainBtn isFrom={transDir === TRANSFER_DIR.ETH_TO_PROTON}>
              <Image
                width="15px"
                height="15px"
                alt="swap_button"
                src="/polygon-matic-logo.png"
              />
              <span>Polygon</span>
            </ChainBtn>

            <SwitchIcon
              onClick={() => {
                setNftType(
                  transDir === TRANSFER_DIR.ETH_TO_PROTON
                    ? NftType.ATOMIC
                    : NftType.ERC_721
                );
                setTransDir(
                  transDir === TRANSFER_DIR.ETH_TO_PROTON
                    ? TRANSFER_DIR.PROTON_TO_ETH
                    : TRANSFER_DIR.ETH_TO_PROTON
                );
              }}
              style={{ order: 3 }}
              role="img">
              <img src="swap-vert-blue.svg" alt="swapIcon" />
            </SwitchIcon>

            <span style={{ order: 4, marginLeft: 20 }}>To</span>
            <ChainBtn isFrom={transDir !== TRANSFER_DIR.ETH_TO_PROTON}>
              <div
                style={{
                  borderRadius: '50%',
                  border: '1px solid #752EEB',
                  width: 16,
                  height: 16,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  width="10px"
                  height="10px"
                  alt="swap_button"
                  src="/proton.svg"
                />
              </div>
              <span>Proton</span>
            </ChainBtn>
          </Switch>

          <TransferFee>
            <span>Fee: &nbsp;</span>
            <span>{displayNumberAsAmount(transferFee, 4, true)} XPR</span>
          </TransferFee>

          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Spinner />
            </div>
          )}

          {!isLoading && (
            <>
              <TabContainer>
                <Tabs>
                  {transDir === TRANSFER_DIR.ETH_TO_PROTON && (
                    <>
                      <Tab
                        selected={nftType === NftType.ERC_721}
                        onClick={() => {
                          setEthAssetsToSend([]);
                          setNftType(NftType.ERC_721);
                        }}>
                        ERC721
                      </Tab>
                      <Tab
                        selected={nftType === NftType.ERC_1155}
                        onClick={() => {
                          setEthAssetsToSend([]);
                          setNftType(NftType.ERC_1155);
                        }}>
                        ERC1155
                      </Tab>
                      <Tab
                        onClick={() => setNftType(NftType.DEPOSIT_LIST)}
                        selected={nftType === NftType.DEPOSIT_LIST}
                        align="right">
                        Deposit List
                      </Tab>
                    </>
                  )}

                  {transDir === TRANSFER_DIR.PROTON_TO_ETH && (
                    <>
                      <Tab
                        selected={nftType === NftType.ATOMIC}
                        onClick={() => setNftType(NftType.ATOMIC)}>
                        Atomic Assets
                      </Tab>
                      {/* <Tab
                        selected={nftType === NftType.MINTED_LIST}
                        onClick={() => setNftType(NftType.MINTED_LIST)}
                        align="right">
                        Minted List
                      </Tab> */}
                    </>
                  )}
                </Tabs>
              </TabContainer>

              {transDir == TRANSFER_DIR.ETH_TO_PROTON &&
                nftType !== NftType.DEPOSIT_LIST &&
                (ethAssetsToSend.length ? (
                  <NftBox>
                    {ethAssetsToSend.map((ethAsset: ETH_ASSET) => (
                      <EthNft
                        data={ethAsset}
                        close={true}
                        key={ethAsset.tokenId}
                        removeSelectedNft={removeSelectedNft}
                      />
                    ))}
                  </NftBox>
                ) : (
                  <NoNFTBox>
                    <Image width="134px" height="106px" src="/proton-pc.png" />
                    <p style={{ marginTop: 20 }}>No NFTs added yet 😢</p>
                  </NoNFTBox>
                ))}

              {transDir == TRANSFER_DIR.PROTON_TO_ETH &&
                nftType !== NftType.MINTED_LIST &&
                (protonAssetsToSend.length ? (
                  <NftBox>
                    {protonAssetsToSend.map((asset: Asset) => (
                      <ProtonNft
                        data={asset}
                        close={true}
                        key={asset.asset_id}
                        removeSelectedNft={removeSelectedNft}
                      />
                    ))}
                  </NftBox>
                ) : (
                  <NoNFTBox>
                    <Image width="134px" height="106px" src="/proton-pc.png" />
                    <div
                      style={{ color: '#1A1A1A', fontSize: 18, marginTop: 20 }}>
                      No NFTs added yet 😢
                    </div>
                  </NoNFTBox>
                ))}

              {nftType === NftType.DEPOSIT_LIST && (
                <TrackingTables selectedTab={NftType.DEPOSIT_LIST} />
              )}

              {nftType === NftType.MINTED_LIST && (
                <TrackingTables selectedTab={NftType.MINTED_LIST} />
              )}

              {nftType !== NftType.DEPOSIT_LIST &&
                nftType !== NftType.MINTED_LIST && (
                  <>
                    <AddNFTBtn
                      onClick={openAssetsModal}
                      disabled={
                        (transDir == TRANSFER_DIR.ETH_TO_PROTON &&
                          nftType === NftType.ERC_721 &&
                          ethAssetsToSend.length > 0) ||
                        (transDir == TRANSFER_DIR.PROTON_TO_ETH &&
                          protonAssetsToSend.length > 0)
                      }>
                      <PlusIcon>+</PlusIcon>
                      <span style={{ marginLeft: 10 }}>Add NFT</span>
                    </AddNFTBtn>
                    <TransferBtn onClick={handleTransfer}>
                      <span>Transfer</span>
                    </TransferBtn>
                  </>
                )}
            </>
          )}
        </Content>
      </Container>
    </>
  );
};

export default NftBridge;
