import getConfig from 'next/config';
import { getFromApi } from '../utils/browser-fetch';

const {
  publicRuntimeConfig: { protonBackendServiceApi },
} = getConfig();

type CachedBased64Strings = {
  [ipfsHash: string]: string;
};

export const uploadToIPFS = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const resultRaw = await fetch(`${protonBackendServiceApi}/market/files`, {
      method: 'POST',
      body: formData,
    });
    const result = await resultRaw.json();

    if (!result || result.error) {
      throw new Error(result.message || 'Unable to upload');
    }

    return result.IpfsHash;
  } catch (e) {
    throw new Error(e);
  }
};

export const getCachedFiles = async (): Promise<CachedBased64Strings> => {
  try {
    const res = await getFromApi<CachedBased64Strings>('/api/cached-files');

    if (!res.success) {
      throw new Error((res.message as unknown) as string);
    }

    return res.message;
  } catch (e) {
    throw new Error(e);
  }
};

export const getCachedMetadataByHash = async (hash: string): Promise<{}> => {
  try {
    const res = await getFromApi<CachedBased64Strings>(
      `/api/cached-files?hash=${hash}`
    );

    if (!res.success) {
      throw new Error((res.message as unknown) as string);
    }

    return res.message;
  } catch (e) {
    throw new Error(e);
  }
};

export default uploadToIPFS;
