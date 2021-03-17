import { useState, useEffect, MouseEvent } from 'react';
import { useAuthContext, useModalContext, MODAL_TYPES } from '../Provider';
import Button from '../Button';
import {
  Background,
  ModalBox,
  Section,
  CloseIconContainer,
  Title,
  Description,
  InputLabel,
  Input,
  ErrorMessage,
  ButtonContainer,
  LinkButton,
} from './Modal.styled';
import ProtonSDK from '../../services/proton';
import { ReactComponent as CloseIcon } from '../../public/close.svg';

export const DepositModal = (): JSX.Element => {
  const { currentUser } = useAuthContext();
  const { openModal, closeModal } = useModalContext();
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (error) setError('');
  }, []);

  const deposit = async () => {
    try {
      const res = await ProtonSDK.deposit({
        actor: currentUser ? currentUser.actor : '',
        amount: `${amount} XPR`,
      });

      if (!res.success) {
        throw new Error('Unable to make deposit.');
      }

      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateNumber = (e) => {
    const inputAmount = e.target.value;
    const formattedAmount = parseFloat(inputAmount).toFixed(4);

    if (inputAmount.length > formattedAmount.length) {
      setAmount(formattedAmount);
    } else {
      setAmount(inputAmount);
    }
  };

  const formatNumber = () => {
    const numberAmount = parseFloat(amount).toFixed(4);
    setAmount(numberAmount);
  };

  const handleBackgroundClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <Background onClick={handleBackgroundClick}>
      <ModalBox>
        <Section>
          <Title>Monster balance</Title>
          <CloseIconContainer role="button" onClick={closeModal}>
            <CloseIcon />
          </CloseIconContainer>
        </Section>
        <Description>
          Proton NFT balances are stored in a smart contract on chain. You can
          withdraw at any time.
        </Description>
        <InputLabel>
          Add funds to your balance
          <Input
            required
            min="0"
            type="number"
            step="0.0001"
            inputMode="decimal"
            placeholder="Enter amount (XPR)"
            value={amount}
            onBlur={formatNumber}
            onChange={updateNumber}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </InputLabel>
        <ButtonContainer>
          <LinkButton onClick={() => openModal(MODAL_TYPES.WITHDRAW)}>
            Withdraw balance
          </LinkButton>
          <Button fullWidth filled onClick={deposit}>
            Add Funds
          </Button>
        </ButtonContainer>
      </ModalBox>
    </Background>
  );
};
