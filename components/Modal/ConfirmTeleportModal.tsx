import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useToasts } from 'react-toast-notifications';
import { useModalContext, ConfirmTeleportModalProps } from '../Provider';
import protonSDK from '../../services/proton';
import {
  Background,
  ModalBox,
  Section,
  CloseIconContainer,
  Title,
  Description,
  HalfButton,
} from './Modal.styled';
import { ReactComponent as CloseIcon } from '../../public/close.svg';
import { teleportToProton, claimNfts } from '../../services/ethereum';
import LoadingPage from '../LoadingPage';

export const ConfirmTeleportModal = (): JSX.Element => {
  const { closeModal, modalProps } = useModalContext();
  const { library } = useWeb3React();
  const { addToast } = useToasts();

  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    ethToProton,
    receiver,
    tokenContract,
    tokenIds,
    assetIds,
    fetchPageData,
  } = modalProps as ConfirmTeleportModalProps;

  useEffect(() => {
    if (error) setError('');
  }, []);

  const teleportNFT = async () => {
    setIsLoading(true);
    if (ethToProton) {
      const txPreHash = await teleportToProton({
        tokenContract: tokenContract,
        tokenIds: tokenIds,
        provider: library.getSigner(),
        to: receiver,
      });

      try {
        await txPreHash.wait();
        addToast('Teleported successfully.', {
          appearance: 'success',
          autoDismiss: true,
        });
        addToast(
          'It will take 1 ~ 2 minutes to have teleported NFT in your WebAuth.com wallet.',
          { appearance: 'info', autoDismiss: false }
        );
      } catch (err) {
        addToast('Teleport failed.', {
          appearance: 'error',
          autoDismiss: true,
        });
      }
    } else {
      const teleportRes = await protonSDK.teleportToEth({
        asset_id: assetIds[0],
        to_address: receiver?.substring(2),
      });

      if (!teleportRes.success) {
        addToast('Teleport failed.', {
          appearance: 'error',
          autoDismiss: true,
        });
      } else {
        addToast('Teleported successfully.', {
          appearance: 'success',
          autoDismiss: true,
        });
        addToast(
          `To claim NFT, please connect recipient's wallet and check the deposit list.`,
          { appearance: 'info', autoDismiss: false }
        );
      }
    }

    await fetchPageData();
    setIsLoading(false);
    closeModal();
  };

  const claimNFT = async () => {
    setIsLoading(true);
    if (ethToProton) {
      try {
        const txPreHash = await claimNfts(
          tokenContract,
          tokenIds,
          library.getSigner()
        );
        await txPreHash.wait();
        addToast('Claimed successfully!', {
          appearance: 'success',
          autoDismiss: true,
        });
      } catch (err) {
        addToast('Claim failed.', { appearance: 'error', autoDismiss: true });
        console.log('claim error', err);
      }
    } else {
      const claimbackRes = await protonSDK.claimbackTeleport({
        asset_id: assetIds[0],
      });

      if (!claimbackRes.success) {
        addToast('Claim back failed.', {
          appearance: 'error',
          autoDismiss: true,
        });
        setIsLoading(false);
        return;
      } else {
        addToast('Claimed successfully!', {
          appearance: 'success',
          autoDismiss: true,
        });
      }
    }

    await fetchPageData();
    setIsLoading(false);
    closeModal();
  };

  return (
    <Background>
      {!isLoading ? (
        <ModalBox>
          <Section>
            <Title>Teleport NFT</Title>
            <CloseIconContainer role="button" onClick={closeModal}>
              <CloseIcon />
            </CloseIconContainer>
          </Section>
          <Description>Are you sure you will teleport NFTs?</Description>
          <Section>
            <HalfButton color="#808080" onClick={claimNFT}>Cancel Teleport</HalfButton>
            <HalfButton onClick={teleportNFT}>Teleport</HalfButton>
          </Section>
        </ModalBox>
      ) : (
        <LoadingPage></LoadingPage>
      )}
    </Background>
  );
};
