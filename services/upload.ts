const uploadToIPFS = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const resultRaw = await fetch(
      `https://api-dev.protonchain.com/v1/chain/files`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const result = await resultRaw.json();
    if (result.success) {
      return result.message.IpfsHash;
    }
  } catch (e) {
    throw new Error(e);
  }
};

export default uploadToIPFS;
