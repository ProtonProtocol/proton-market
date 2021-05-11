import {
  IPFS_RESOLVER_IMAGE,
  RESIZER_IMAGE,
  IPFS_RESOLVER_VIDEO,
} from '../../utils/constants';
import { ImageIcon, VideoIcon } from './TemplateIcon.styled';

type TemplateIconProps = {
  image?: string;
  video?: string;
  name?: string;
  margin?: string;
  size?: string;
};

const TemplateIcon = ({
  image,
  video,
  name,
  size,
  margin,
}: TemplateIconProps): JSX.Element => {
  const isIpfs =
    (image && image.slice(0, 4).toLowerCase() !== 'data') ||
    (video && video.slice(0, 4).toLowerCase() !== 'data');
  const imageSrc = isIpfs
    ? `${RESIZER_IMAGE}${IPFS_RESOLVER_IMAGE}${image}`
    : image || '/icon-monsters.png';

  const onImageError = (e) => {
    e.currentTarget.onerror = null;
    if (isIpfs) {
      e.currentTarget.src = `${IPFS_RESOLVER_IMAGE}${image}`;
    }
  };

  if (video) {
    <VideoIcon
      size={size}
      muted
      playsInline
      src={isIpfs ? `${IPFS_RESOLVER_VIDEO}${video}` : video}
    />;
  } else {
    return (
      <ImageIcon
        alt={name}
        src={imageSrc}
        onError={onImageError}
        objectFit="cover"
        margin={margin}
        size={size}
      />
    );
  }
};

export default TemplateIcon;
