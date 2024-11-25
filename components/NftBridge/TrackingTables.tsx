import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useToasts } from 'react-toast-notifications';
import { useAuthContext } from '../Provider';
import { getDepositList, claimNfts, NftType } from '../../services/ethereum';
import proton from '../../services/proton-rpc';
import { shortenAddress } from '../../utils';
import Button from '../Button';
import Spinner from '../Spinner';
import TableHeaderRow from '../TableHeaderRow';
import TableRow from '../TableRow';
import {
  TableWrapper,
  Table,
  TableHeaderCell,
  TableDataCell,
} from './NftBridge.styled';
import TableContentWrapper from '../TableContentWraper';
import protonSDK from '../../services/proton';

interface Props {
  selectedTab: NftType;
}

export const TrackingTables = (props: Props): JSX.Element => {
  const { selectedTab } = props;
  const { library, account } = useWeb3React();
  const { addToast } = useToasts();
  const { currentUser } = useAuthContext();

  const [depositList, setDepositList] = useState([]);
  const [mintedList, setMintedList] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedTab == NftType.DEPOSIT_LIST) {
      fetchDepositList();
    } else {
      fetchMintedList();
    }
  }, [account, selectedTab]);

  const fetchDepositList = async () => {
    if (!library) return;

    setIsLoading(true);
    setDepositList([]);
    const res = await getDepositList(account, library.getSigner());
    const filtered = res?.filter((el) => !el.locked);
    setDepositList(filtered);
    setIsLoading(false);
  };

  const fetchMintedList = async () => {
    setIsLoading(true);
    setMintedList([]);
    const res = await proton.getMintedForTeleport(currentUser.actor);
    setMintedList(res);
    setIsLoading(false);
  };

  const claimEth = async (contract: string, tokenId: string) => {
    if (!library) {
      addToast('Please connect your Ethereum wallet', {
        appearance: 'error',
        autoDismiss: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      const txPreHash = await claimNfts(
        contract,
        [tokenId],
        library.getSigner()
      );
      await txPreHash.wait();
      const list = depositList.filter(
        (el) => el.contract != contract && el.tokenId.toHexString() != tokenId
      );
      setDepositList(list);
      addToast('Claimed successfully!', {
        appearance: 'success',
        autoDismiss: true,
      });
      // Refresh deposit list
      // await fetchDepositList();
      setIsLoading(false);
    } catch (err) {
      addToast('Claim failed.', { appearance: 'error', autoDismiss: true });
      setIsLoading(false);
      console.log('claim error', err);
    }
  };

  const claimProton = async (assetId: string) => {
    const claimbackRes = await protonSDK.claimbackTeleport({
      asset_id: assetId,
    });

    if (!claimbackRes.success) {
      addToast('Claim back failed.', {
        appearance: 'error',
        autoDismiss: true,
      });
      setIsLoading(false);
      return;
    } else {
      const list = mintedList.filter(_ => _.asset_id != assetId);
      setMintedList(list);
      addToast('Claimed successfully!', {
        appearance: 'success',
        autoDismiss: true,
      });
    }
  };

  return (
    <>
      {isLoading && <Spinner></Spinner>}

      {!isLoading && selectedTab == NftType.DEPOSIT_LIST && (
        <TableWrapper>
          <Table>
            <thead>
              <TableHeaderRow>
                <TableHeaderCell width={5}>#</TableHeaderCell>
                <TableHeaderCell width={25}>OWNER</TableHeaderCell>
                <TableHeaderCell width={25}>COLLECTION</TableHeaderCell>
                <TableHeaderCell width={25}>TOKEN ID</TableHeaderCell>
                <TableHeaderCell width={20}>ACTION</TableHeaderCell>
              </TableHeaderRow>
            </thead>
            <tbody>
              <TableContentWrapper
                loading={isLoading}
                noData={!depositList.length}
                columns={5}>
                {depositList.length > 0 &&
                  depositList.map((el, idx) => (
                    <TableRow key={idx}>
                      <TableDataCell>{idx + 1}</TableDataCell>
                      <TableDataCell>{shortenAddress(el.owner)}</TableDataCell>
                      <TableDataCell>
                        {shortenAddress(el.collection)}
                      </TableDataCell>
                      <TableDataCell>
                        {el.tokenId.toHexString().length > 15
                          ? shortenAddress(el.tokenId.toHexString())
                          : el.tokenId.toHexString()}
                      </TableDataCell>
                      <TableDataCell>
                        <Button
                          smallSize={true}
                          disabled={el.locked}
                          onClick={() =>
                            claimEth(el.collection, el.tokenId.toHexString())
                          }>
                          Back to owner
                        </Button>
                      </TableDataCell>
                    </TableRow>
                  ))}
              </TableContentWrapper>
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {!isLoading && selectedTab == NftType.MINTED_LIST && (
        <TableWrapper>
          <Table>
            <thead>
              <TableHeaderRow>
                <TableHeaderCell width={5}>#</TableHeaderCell>
                <TableHeaderCell width={25}>Asset ID</TableHeaderCell>
                <TableHeaderCell width={25}>Owner</TableHeaderCell>
                <TableHeaderCell ></TableHeaderCell>
              </TableHeaderRow>
            </thead>
            <tbody>
              <TableContentWrapper
                loading={isLoading}
                noData={!mintedList.length}
                columns={5}>
                {mintedList.length > 0 &&
                  mintedList.map((el, idx) => (
                    <TableRow key={idx}>
                      <TableDataCell>{mintedList.length - idx}</TableDataCell>
                      <TableDataCell>{el.asset_id}</TableDataCell>
                      <TableDataCell>{el.owner}</TableDataCell>
                      <TableDataCell>
                        <Button
                          smallSize={true}
                          onClick={() =>
                            claimProton(el.asset_id)
                          }>
                          Claim
                        </Button>
                      </TableDataCell>
                    </TableRow>
                  ))}
              </TableContentWrapper>
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </>
  );
};
