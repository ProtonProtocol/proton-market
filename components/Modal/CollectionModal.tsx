import {
  FormEventHandler,
  MouseEvent,
  useState,
  useRef,
  useEffect,
} from 'react';
import { useAuthContext, useModalContext } from '../Provider';
import { CreateCollectionProps, UpdateCollectionProps } from '../Provider';
import DragDropFileUploadSm from '../DragDropFileUploadSm';
import InputField from '../InputField';
import Spinner from '../Spinner';
import {
  Background,
  ModalBox,
  Section,
  CloseIconContainer,
  Title,
  Form,
  Row,
  Column,
  HalfButton,
  DragDropButton,
  Description,
  ErrorMessage,
} from './Modal.styled';
import { useWindowSize } from '../../hooks';
import uploadToIPFS from '../../services/upload';
import { ReactComponent as CloseIcon } from '../../public/close.svg';
import { fileReader, delay } from '../../utils';
import ProtonSDK from '../../services/proton';
import { SM_FILE_UPLOAD_TYPES_TEXT } from '../../utils/constants';

const TYPES = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
};

type Props = {
  type: string;
  modalProps: CreateCollectionProps | UpdateCollectionProps;
};

const CollectionModal = ({ type, modalProps }: Props): JSX.Element => {
  const { currentUser } = useAuthContext();
  const { isMobile } = useWindowSize();
  const { closeModal } = useModalContext();
  const uploadInputRef = useRef<HTMLInputElement>();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [royalties, setRoyalties] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>();
  const [updatedImage, setUpdatedImage] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (type === TYPES.UPDATE) {
      const {
        collectionName,
        defaultDescription,
        defaultDisplayName,
        defaultRoyalties,
        defaultImage,
      } = modalProps as UpdateCollectionProps;
      setName(collectionName);
      setDescription(defaultDescription);
      setDisplayName(defaultDisplayName);
      setRoyalties((parseFloat(defaultRoyalties) * 100).toString());
      setUpdatedImage(defaultImage);
    }
  }, []);

  const create = async () => {
    const {
      setNewCollection,
      setSelectedCollection,
      setIsUncreatedCollectionSelected,
    } = modalProps as CreateCollectionProps;
    try {
      const ipfsImage = await uploadToIPFS(uploadedFile);
      fileReader((img) => {
        setSelectedCollection({
          collection_name: name,
          name: displayName,
          img,
        });
      }, uploadedFile);

      setNewCollection({
        collection_name: name,
        name: displayName,
        img: ipfsImage,
        description: description,
        royalties,
      });

      setIsUncreatedCollectionSelected(true);
      closeModal();
    } catch (err) {
      setFormError('Unable to upload the collection image. Please try again.');
    }
  };

  const update = async () => {
    try {
      if (uploadedFile) {
        const ipfsImage = await uploadToIPFS(uploadedFile);
        setUpdatedImage(ipfsImage);
        fileReader((img) => setUpdatedImage(img), uploadedFile);
      }

      const {
        defaultRoyalties,
        fetchPageData,
      } = modalProps as UpdateCollectionProps;

      const hasUpdatedRoytalies =
        parseFloat(defaultRoyalties) !== parseInt(royalties) / 100;

      const res = await ProtonSDK.updateCollection({
        author,
        collection_name: name,
        description,
        display_name: displayName,
        image: updatedImage,
        market_fee: hasUpdatedRoytalies
          ? (parseInt(royalties) / 100).toFixed(6)
          : '',
      });

      if (!res.success) {
        throw new Error('Unable to update the collection. Please try again.');
      }

      await delay(1000); // 1 second delay to give blockchain time to update before refetching page data
      closeModal();
      await fetchPageData();
    } catch (err) {
      setFormError('Unable to update the collection. Please try again.');
    }
  };

  const formActions = {
    [TYPES.CREATE]: create,
    [TYPES.UPDATE]: update,
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setFormError('');

    const errors = [];

    if (!(uploadedFile || updatedImage) || uploadError) {
      errors.push(`upload a ${SM_FILE_UPLOAD_TYPES_TEXT}`);
    }

    if (!displayName) {
      errors.push('set a display name');
    }

    if (!description) {
      errors.push('set a description');
    }

    if (!royalties) {
      errors.push('set royalties');
    }

    if (errors.length === 1) {
      setFormError(`Please ${errors[0]}.`);
      return;
    }

    if (errors.length === 2) {
      setFormError(`Please ${errors[0]} and ${errors[1]}.`);
      return;
    }

    if (errors.length > 2) {
      const lastErrorIndex = errors.length - 1;
      let errorMessage = `Please ${errors[0]}`;

      for (let i = 1; i < errors.length; i++) {
        if (i === lastErrorIndex) {
          errorMessage += `, and ${errors[i]}.`;
          break;
        }
        errorMessage += `, ${errors[i]}`;
      }

      setFormError(errorMessage);
      return;
    }

    setIsLoading(true);
    await formActions[type]();
    setIsLoading(false);
  };

  const createCollectionName = () => {
    const collectionName = [];
    const characters = '12345';
    const charactersLength = characters.length;
    for (let i = 0; i < 12; i++) {
      collectionName.push(
        characters.charAt(Math.floor(Math.random() * charactersLength))
      );
    }
    return collectionName.join('');
  };

  const handleBackgroundClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const openUploadWindow = () => {
    if (uploadInputRef && uploadInputRef.current) {
      uploadInputRef.current.click();
    }
  };

  useEffect(() => {
    (async () => {
      if (!name) {
        let isUnique = false;

        while (!isUnique) {
          const collectionName = createCollectionName();
          try {
            const result = await getFromApi<Collection>(
              `${process.env.NEXT_PUBLIC_NFT_ENDPOINT}/atomicassets/v1/collections/${collectionName}`
            );
            if (!result.success) {
              setName(collectionName);
              isUnique = true;
            }
          } catch (e) {
            throw new Error(e);
          }
        }
      }
    })();
  }, []);

  return (
    <Background onClick={handleBackgroundClick}>
      <ModalBox>
        <Section>
          <Title>{type === TYPES.UPDATE ? 'Update' : 'New'} collection</Title>
          <CloseIconContainer role="button" onClick={closeModal}>
            <CloseIcon />
          </CloseIconContainer>
        </Section>
        <Row>
          <DragDropFileUploadSm
            placeholderImage={updatedImage}
            uploadInputRef={uploadInputRef}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            setUploadError={setUploadError}
            setFormError={setFormError}
          />
          <Column>
            <Description mb="8px">
              We recommend an image of at least 400x400. Gifs work too.
            </Description>
            <DragDropButton onClick={openUploadWindow}>
              Choose file
            </DragDropButton>
            <ErrorMessage>{uploadError}</ErrorMessage>
          </Column>
        </Row>
        <Form onSubmit={isLoading ? null : handleSubmit}>
          <InputField
            placeholder="Collection Name"
            value={name}
            setValue={setName}
            setFormError={setFormError}
            disabled={type === TYPES.UPDATE}
            checkIfIsValid={(input: string) => {
              const hasValidCharacters = !!input.match(/^[a-z1-5]+$/);
              const isValidLength = input.length === 12;
              const isValid =
                (hasValidCharacters && isValidLength) ||
                input.toLowerCase() === author.toLowerCase();
              const errorMessage = `Collection name should be your account name (${author}) or a 12-character long name that only contains the numbers 1-5 or lowercase letters a-z`;
              return {
                isValid,
                errorMessage,
              };
            }}
            mb="16px"
          />
          <InputField
            placeholder="Display Name"
            value={displayName}
            setFormError={setFormError}
            setValue={setDisplayName}
            mb="16px"
          />
          <InputField
            placeholder="Description"
            value={description}
            setFormError={setFormError}
            setValue={setDescription}
          />
          <InputField
            mt="16px"
            mb="24px"
            inputType="number"
            min={0}
            max={15}
            step={1}
            value={royalties}
            setValue={setRoyalties}
            placeholder="Royalties"
            tooltip="A percentage of gross revenues derived from the use of an asset sold"
            numberOfTooltipLines={3}
            checkIfIsValid={(input) => {
              const numberInput = parseFloat(input as string);
              const isValid =
                !isNaN(numberInput) && numberInput >= 0 && numberInput <= 15;
              const errorMessage = 'Royalties must be between 0% and 15%';
              return {
                isValid,
                errorMessage,
              };
            }}
          />
          <ErrorMessage>{formError}</ErrorMessage>
          <HalfButton
            fullWidth={isMobile}
            type="submit"
            disabled={formError.length > 0 || isLoading}
            padding={isLoading ? '0 58px' : '11px 16px 13px'}>
            {isLoading ? (
              <Spinner size="42px" radius="10" hasBackground />
            ) : (
              `${type === TYPES.UPDATE ? 'Update' : 'Create'} Collection`
            )}
          </HalfButton>
        </Form>
      </ModalBox>
    </Background>
  );
};

export const CreateCollectionModal = (): JSX.Element => {
  const { modalProps } = useModalContext() as {
    modalProps: CreateCollectionProps;
  };
  return <CollectionModal type={TYPES.CREATE} modalProps={modalProps} />;
};

export const UpdateCollectionModal = (): JSX.Element => {
  const { modalProps } = useModalContext() as {
    modalProps: UpdateCollectionProps;
  };
  return <CollectionModal type={TYPES.UPDATE} modalProps={modalProps} />;
};
