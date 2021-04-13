import {
  BoxContainer,
  CollectionName,
  CollectionSubName,
} from './CollectionBox.styled';
import CollectionIcon from '../CollectionIcon';
import { Collection } from '../../services/collections';
import { capitalize } from '../../utils';

type CollectionBoxProps = {
  collection: Collection;
  active?: boolean;
};

const CollectionBox = ({
  collection,
  active,
}: CollectionBoxProps): JSX.Element => {
  const { collection_name, name, img } = collection;
  return (
    <BoxContainer active={active}>
      <CollectionIcon name={collection_name} image={img} width="40px" />
      <CollectionName>{capitalize(name || collection_name)}</CollectionName>
      <CollectionSubName>#{collection_name}</CollectionSubName>
    </BoxContainer>
  );
};

export default CollectionBox;
