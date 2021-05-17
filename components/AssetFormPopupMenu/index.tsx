import { useState, useEffect } from 'react';
import {
  MenuContainer,
  PopupMenuButton,
  Menu,
  MenuItem,
  TransparentBackground,
} from './AssetFormPopupMenu.styled';
import { ReactComponent as Ellipsis } from '../../public/ellipsis.svg';
import {
  useModalContext,
  useAuthContext,
  MODAL_TYPES,
  MintAssetModalProps,
} from '../Provider';
import { useScrollLock, useEscapeKeyClose } from '../../hooks';
import proton from '../../services/proton-rpc';
import { REPORT_TYPE } from '../../utils/constants';

type Props = {
  setCurrentAssetAsModalProps?: () => void;
  assetIds?: string[];
  saleIds?: string[];
  isTemplateCreator?: boolean;
  isMyTemplate: boolean;
};

const AssetFormPopupMenu = ({
  setCurrentAssetAsModalProps,
  assetIds,
  saleIds,
  isTemplateCreator,
  isMyTemplate,
}: Props): JSX.Element => {
  const { currentUser } = useAuthContext();
  const actor = currentUser ? currentUser.actor : '';
  const { openModal, modalProps, setModalProps } = useModalContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isModalWithFeeOpen, setIsModalWithFeeOpen] = useState<boolean>(false);
  const togglePopupMenu = () => setIsOpen(!isOpen);
  const closePopupMenu = () => setIsOpen(false);
  const [accountRam, setAccountRam] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<number>(0);
  useScrollLock(isOpen);
  useEscapeKeyClose(closePopupMenu);

  useEffect(() => {
    (async () => {
      const { max, used } = await proton.getAccountRam(actor);
      const rate = await proton.getXPRtoXUSDCConversionRate();
      setAccountRam(max - used);
      setConversionRate(rate);
    })();
  }, [actor, isModalWithFeeOpen]);

  const isMintAssetModalHidden = (): boolean => {
    if (!modalProps) return true;
    const { maxSupply, issuedSupply } = modalProps as MintAssetModalProps;
    const hasMintedMaxSupply =
      maxSupply && issuedSupply && maxSupply === issuedSupply;
    return !isTemplateCreator || hasMintedMaxSupply;
  };

  const popupMenuItems = [
    {
      isHidden: !isMyTemplate || !assetIds || assetIds.length === 0,
      name: 'Mark all for sale',
      onClick: () => {
        setIsOpen(false);
        setIsModalWithFeeOpen(true);
        openModal(MODAL_TYPES.CREATE_MULTIPLE_SALES);
        setModalProps((previousModalProps) => ({
          ...previousModalProps,
          accountRam,
          conversionRate,
          setIsModalWithFeeOpen,
        }));
      },
    },
    {
      isHidden: !isMyTemplate || isMintAssetModalHidden(),
      name: 'Mint more assets',
      onClick: () => {
        setIsOpen(false);
        setIsModalWithFeeOpen(true);
        openModal(MODAL_TYPES.MINT_ASSET);
        setModalProps((previousModalProps) => ({
          ...previousModalProps,
          accountRam,
          conversionRate,
          setIsModalWithFeeOpen,
        }));
      },
    },
    {
      isHidden: !isMyTemplate || assetIds.length === 0,
      name: 'Transfer NFT',
      onClick: () => {
        setIsOpen(false);
        openModal(MODAL_TYPES.TRANSFER);
        setCurrentAssetAsModalProps();
      },
    },
    {
      isHidden: !isMyTemplate || assetIds.length === 0,
      name: 'Burn NFT',
      onClick: () => {
        setIsOpen(false);
        openModal(MODAL_TYPES.BURN_ASSET);
        setCurrentAssetAsModalProps();
      },
    },
    {
      isHidden: !isMyTemplate || !saleIds || saleIds.length === 0,
      name: 'Cancel all sales',
      onClick: () => {
        setIsOpen(false);
        openModal(MODAL_TYPES.CANCEL_MULTIPLE_SALES);
      },
    },
    {
      isHidden: isTemplateCreator,
      name: 'Report',
      onClick: () => {
        setModalProps({ type: REPORT_TYPE.NFT });
        setIsOpen(false);
        openModal(MODAL_TYPES.REPORT);
      },
    },
  ];

  return (
    <MenuContainer>
      <PopupMenuButton onClick={togglePopupMenu}>
        <Ellipsis />
      </PopupMenuButton>
      <Menu isOpen={isOpen}>
        {popupMenuItems.map(({ isHidden, name, onClick }) => {
          if (!isHidden) {
            return (
              <MenuItem key={name} tabIndex={0} onClick={onClick}>
                {name}
              </MenuItem>
            );
          }
        })}
      </Menu>
      <TransparentBackground isOpen={isOpen} onClick={closePopupMenu} />
    </MenuContainer>
  );
};

export default AssetFormPopupMenu;
