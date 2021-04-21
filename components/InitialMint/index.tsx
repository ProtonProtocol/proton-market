import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  Title,
  SubTitle,
  Step,
  Terms,
  TermsLink,
  ErrorMessage,
  FeeLabel,
} from '../CreatePageLayout/CreatePageLayout.styled';
import InputField from '../InputField';
import Button from '../Button';
import Spinner from '../Spinner';
import { BackButton } from '../CreatePageLayout/CreatePageLayout.styled';
import { CREATE_PAGE_STATES } from '../../pages/create';
import { calculateFee } from '../../utils';
import { RAM_COSTS, SHORTENED_TOKEN_PRECISION } from '../../utils/constants';

type Props = {
  mintAmount: string;
  setMintAmount: Dispatch<SetStateAction<string>>;
  createNft: () => Promise<void>;
  createNftError: string;
  setPageState: Dispatch<SetStateAction<string>>;
  maxSupply: string;
  accountRam: number;
  contractRam: number;
  conversionRate: number;
};

const InitialMint = ({
  createNft,
  setMintAmount,
  mintAmount,
  createNftError,
  setPageState,
  maxSupply,
  accountRam,
  contractRam,
  conversionRate,
}: Props): JSX.Element => {
  const [mintError, setMintError] = useState<string>('');
  const [mintFee, setMintFee] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      setMintAmount('');
      setMintFee(0);
    };
  }, []);

  useEffect(() => {
    if (createNftError) {
      setMintError(createNftError);
    } else {
      setMintError('');
    }
  }, [createNftError]);

  useEffect(() => {
    const numAssets = parseInt(mintAmount);
    const mintFee = calculateFee({
      numAssets: isNaN(numAssets) ? 0 : numAssets,
      currentRamAmount: contractRam,
      ramCost: RAM_COSTS.MINT_ASSET,
      conversionRate,
    });
    const accountRamCosts =
      RAM_COSTS.CREATE_COLLECTION_SCHEMA_TEMPLATE - accountRam;
    const ramFee = accountRamCosts > 0 ? accountRamCosts : 0;
    const fee = mintFee + ramFee;
    setMintFee(isNaN(fee) ? 0 : fee);
  }, [mintAmount, isLoading]);

  const validateAndProceed = async () => {
    if (!mintAmount) {
      setMintError('Please fill in an initial mint amount (minimum 1).');
    } else {
      setMintError('');
      setIsLoading(true);
      try {
        await createNft();
      } catch (e) {
        setMintError(e);
      }
      setIsLoading(false);
    }
  };

  const checkMintAmountValidity = (amount) => {
    const number = parseInt(amount);
    if (number >= 1 && number <= 50 && number <= parseInt(maxSupply)) {
      return true;
    }
    return false;
  };

  const getFee = () =>
    mintFee && mintFee !== 0 ? (
      <FeeLabel>
        <span>Mint Fee</span>
        <span>{mintFee.toFixed(SHORTENED_TOKEN_PRECISION)} XUSDC</span>
      </FeeLabel>
    ) : null;

  return (
    <>
      <Step>Step 3 of 3</Step>
      <Title>Initial Mint</Title>
      <SubTitle>
        Now you are ready to mint your NFT. Choose an initial mint amount (first
        10 are for free). Minting takes a bit of time, so we recommend no more
        than 50 tokens in your initial mint.
      </SubTitle>
      <InputField
        inputType="number"
        min={1}
        max={50}
        step={1}
        mt="8px"
        value={mintAmount}
        setValue={setMintAmount}
        placeholder="Enter amount"
        submit={isValid ? null : createNft}
        checkIfIsValid={(input) => {
          const numberInput = parseInt(input as string);
          const valid = checkMintAmountValidity(numberInput);
          setIsValid(valid);
          const errorMessage =
            numberInput < parseInt(maxSupply)
              ? 'You can mint 1-50 assets at a time'
              : 'You cannot mint more than the set edition size';
          return {
            isValid: valid,
            errorMessage,
          };
        }}
      />
      {getFee()}
      <Terms>By clicking “Create NFT” you agree to our</Terms>
      <TermsLink target="_blank" href="https://www.protonchain.com/terms">
        Terms of Service &amp; Privacy Policy
      </TermsLink>
      {mintError ? <ErrorMessage>{mintError}</ErrorMessage> : null}
      <Button
        onClick={isLoading ? null : validateAndProceed}
        disabled={parseInt(mintAmount) > 50 || isLoading}
        padding={isLoading ? '0' : '12px 0'}>
        {isLoading ? (
          <Spinner size="42px" radius="10" hasBackground />
        ) : (
          'Create NFT'
        )}
      </Button>
      <BackButton
        onClick={() => setPageState(CREATE_PAGE_STATES.CREATE_TEMPLATE)}>
        Back
      </BackButton>
    </>
  );
};

export default InitialMint;
