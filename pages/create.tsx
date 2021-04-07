import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import TemplateCard from '../components/TemplateCard';
import InputField from '../components/InputField';
import DragDropFileUploadLg from '../components/DragDropFileUploadLg';
import { useModalContext, MODAL_TYPES } from '../components/Provider';
import {
  Container,
  Row,
  LeftColumn,
  RightColumn,
  Title,
  SubTitle,
  ElementTitle,
  EmptyBox2,
  Terms,
  TermsLink,
  BoxButton,
} from '../styles/CreatePage';

const Create = (): JSX.Element => {
  const { openModal, setModalProps } = useModalContext();
  const [collectionName, setCollectionName] = useState<string>('');
  const [collectionImage, setCollectionImage] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>('');
  const [templateImage, setTemplateImage] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [royalties, setRoyalties] = useState<string>('');
  const [editionSize, setEditionSize] = useState<string>('');
  const [mintAmount, setMintAmount] = useState<string>('');
  const [templateUploadedFile, setTemplateUploadedFile] = useState<File | null>(
    null
  );
  const [isAudio, setIsAudio] = useState<boolean>(false);
  const [isVideo, setIsVideo] = useState<boolean>(false);

  useEffect(() => {
    if (templateUploadedFile && window) {
      const filetype = templateUploadedFile.type;
      if (filetype.includes('audio')) {
        setIsAudio(true);
        setIsVideo(false);
      } else if (filetype.includes('video')) {
        setIsVideo(true);
        setIsAudio(false);
      } else {
        const reader = new window.FileReader();
        reader.onload = () => {
          setTemplateImage(reader.result as string);
          setIsAudio(false);
          setIsVideo(false);
        };
        reader.readAsDataURL(templateUploadedFile);
      }
    }
  }, [templateUploadedFile]);

  const getUserCollections = async () => {
    console.log('refetch user collections');
  };

  const createCollection = () => {
    openModal(MODAL_TYPES.CREATE_COLLECTION);
    setModalProps({
      fetchPageData: getUserCollections,
      setCollectionImage: setCollectionImage,
      setCollectionName: setCollectionName,
    });
  };

  return (
    <PageLayout title="Create">
      <Container>
        <Row>
          <LeftColumn>
            <Title>Create new NFT</Title>
            <SubTitle>
              Every new account can create up to 10 NFTs for free. After that a
              small fee per NFT is charged reflecting network costs.
            </SubTitle>
            <ElementTitle>Upload file</ElementTitle>
            <DragDropFileUploadLg
              setTemplateUploadedFile={setTemplateUploadedFile}
            />
            <ElementTitle>Choose Collection</ElementTitle>
            <Row>
              <BoxButton onClick={createCollection}>
                <Image
                  priority
                  layout="fixed"
                  width={40}
                  height={40}
                  alt="plus icon"
                  src="/plus-icon.png"
                />
                <span>Create</span>
              </BoxButton>
              <EmptyBox2 />
            </Row>
            <InputField
              mt="16px"
              value={templateName}
              setValue={setTemplateName}
              placeholder="Name"
            />
            <InputField
              mt="16px"
              value={description}
              setValue={setDescription}
              placeholder="Description"
            />
            <Row>
              <InputField
                mt="16px"
                mr="4px"
                value={royalties}
                setValue={setRoyalties}
                placeholder="Royalties"
                tooltip=" "
                numberOfTooltipLines={1}
              />
              <InputField
                mt="16px"
                ml="4px"
                value={editionSize}
                setValue={setEditionSize}
                placeholder="Edition Size"
                tooltip=" "
                numberOfTooltipLines={1}
              />
            </Row>
            <ElementTitle>Initial Mint</ElementTitle>
            <InputField
              value={mintAmount}
              setValue={setMintAmount}
              placeholder="Mint Amount"
              tooltip=" "
              numberOfTooltipLines={1}
            />
            <Terms>By clicking “Create NFT” you agree to our</Terms>
            <TermsLink target="_blank" href="https://www.protonchain.com/terms">
              Terms of Service &amp; Privacy Policy
            </TermsLink>
            <Button onClick={null}>Create NFT</Button>
          </LeftColumn>
          <RightColumn>
            <ElementTitle>Preview</ElementTitle>
            <TemplateCard
              templateImage={templateImage}
              templateName={templateName}
              collectionImage={collectionImage}
              collectionName={collectionName}
              editionSize={editionSize}
              noHoverEffect={true}
              noIpfsConversion={true}
              isAudio={isAudio}
              isVideo={isVideo}
              isStatic={true}
            />
          </RightColumn>
        </Row>
      </Container>
    </PageLayout>
  );
};

export default Create;
