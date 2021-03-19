import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '../Button';
import {
  Background,
  Nav,
  AvatarContainer,
  ImageLink,
  NavLink,
  GradientBackground,
  MobileIcon,
  DropdownList,
  DesktopIcon,
  Name,
  Subtitle,
  Balance,
} from './NavBar.styled';
import { useScrollLock } from '../../hooks';
import { useAuthContext, useModalContext, MODAL_TYPES } from '../Provider';
import { EMPTY_BALANCE } from '../../utils/constants';

type DropdownProps = {
  isOpen: boolean;
  closeNavDropdown: () => void;
};

const Logo = (): JSX.Element => {
  const { currentUser } = useAuthContext();
  return (
    <Link href="/" passHref>
      <ImageLink>
        <DesktopIcon>
          <Image
            priority
            layout="fixed"
            width={143}
            height={32}
            alt="logo"
            src="/logo@3x.png"
          />
        </DesktopIcon>
        <MobileIcon>
          <Image
            priority
            layout="fixed"
            width={currentUser ? 143 : 32}
            height={32}
            alt="logo"
            src={currentUser ? '/logo@3x.png' : '/logo.svg'}
          />
        </MobileIcon>
      </ImageLink>
    </Link>
  );
};

const UserAvatar = ({ isOpen, avatar, toggleNavDropdown }) => {
  const currentUserAvatar = (
    <AvatarContainer>
      <Image priority layout="fill" alt="chain account avatar" src={avatar} />
    </AvatarContainer>
  );

  const mobileNavbarIcon = isOpen ? (
    <AvatarContainer>
      <Image priority layout="fill" alt="close" src="/x.svg" />
    </AvatarContainer>
  ) : (
    currentUserAvatar
  );

  return (
    <>
      <DesktopIcon onClick={toggleNavDropdown} role="button">
        {currentUserAvatar}
      </DesktopIcon>
      <MobileIcon onClick={toggleNavDropdown} role="button">
        {mobileNavbarIcon}
      </MobileIcon>
    </>
  );
};

const Dropdown = ({ isOpen, closeNavDropdown }: DropdownProps): JSX.Element => {
  const { currentUser, currentUserBalance, logout } = useAuthContext();
  const { openModal } = useModalContext();

  const routes = [
    {
      name: 'Deposit / Withdraw',
      path: '',
      onClick: () => openModal(MODAL_TYPES.DEPOSIT),
    },
    {
      name: "My NFT's",
      path: `/my-nfts/${currentUser ? currentUser.actor : ''}`,
      onClick: closeNavDropdown,
    },
    {
      name: 'Marketplace',
      path: '/',
      onClick: closeNavDropdown,
    },
    {
      name: 'Sign out',
      path: '',
      onClick: () => {
        closeNavDropdown();
        logout();
      },
    },
  ];

  return (
    <DropdownList isOpen={isOpen}>
      <Name>{currentUser ? currentUser.name : ''}</Name>
      <Subtitle>Balance</Subtitle>
      <Balance>{currentUserBalance ? currentUserBalance : EMPTY_BALANCE}</Balance>
      {routes.map(({ name, path, onClick }) =>
        path ? (
          <Link href={path} passHref key={name}>
            <NavLink onClick={onClick}>{name}</NavLink>
          </Link>
        ) : (
          <NavLink onClick={onClick} key={name}>
            {name}
          </NavLink>
        )
      )}
    </DropdownList>
  );
};

const NavBar = (): JSX.Element => {
  const { currentUser, login } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginDisabled, setIsLoginDisabled] = useState<boolean>(false);
  useScrollLock(isOpen);

  const toggleNavDropdown = () => setIsOpen(!isOpen);

  const closeNavDropdown = () => {
    if (isOpen) setIsOpen(false);
  };

  const connectWallet = async () => {
    setIsLoginDisabled(true);
    await login();
    closeNavDropdown();
    setIsLoginDisabled(false);
  };

  return (
    <Background>
      <Nav>
        <Logo />
        {currentUser && currentUser.avatar ? (
          <UserAvatar
            isOpen={isOpen}
            avatar={currentUser.avatar}
            toggleNavDropdown={toggleNavDropdown}
          />
        ) : (
          <Button
            rounded
            filled
            disabled={isLoginDisabled}
            onClick={connectWallet}>
            Connect Wallet
          </Button>
        )}
        <Dropdown isOpen={isOpen} closeNavDropdown={closeNavDropdown} />
        <GradientBackground isOpen={isOpen} onClick={closeNavDropdown} />
      </Nav>
    </Background>
  );
};

export default NavBar;
