import styled from 'styled-components';
import { breakpoint } from '../../styles/Breakpoints';

export const Container = styled.div`
  width: 100%;
  padding: 0 10px;
`;

export const Header = styled.div`
  width: 100%;
  padding: 42px 0px;
  text-align: center;
`;

export const HeaderTitle = styled.p`
  font-size: 48px;
  font-weight: 500;
  line-height: 56px;
  color: #1A1A1A;
  ${breakpoint.mobile`
    font-size: 36px;
  `};
`;

export const SubTitle = styled.p`
  width: 100%;
  max-width: 500px;
  color: #808080;
  font-size: 20px;
  font-weight: 450;
  line-height: 28px;
  margin: 30px auto 0;
`;

export const ContentHeader = styled.p`
  color: #1A1A1A;
  margin: 10px auto;
  font-size: 28px;
  line-height: 35px;
  font-weight: 500;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #FEFEFE;
  margin: 0 auto 20px;
`;

export const Switch = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px 0;
  color: #6B717F;
  ${breakpoint.mobile`
    & > span {
      display: none;
    };
  `};
`;

export const ChainBtn = styled.div<{isFrom: boolean}>`
  order: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 120px;
  border-radius: 8px;
  font-size: 16px;
  color: #1A1A1A;
  padding: 4px 15px;
  background: #F2F2F2;
  margin: 0 20px;

  ${({ isFrom }) =>
  !isFrom &&
  `
  order: 5
  `};
`;

export const InfoBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-itmes: center;
  width: 100%;
  max-width: 400px;
  padding: 30px 0 0;
  color: #4710a3;
  ${breakpoint.mobile`
    flex-direction: column;
    align-items: center;
  `};
`;

export const MessageBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0px;
  color: #808080;
  text-align: center;
  font-size: 20px;
  font-weight: 450;
  line-height: 28px;
`;

export const NftBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  border-bottom: 1px solid #808080;
  padding-bottom: 20px;
  ${breakpoint.mobile`
    flex-direction: column;
    align-items: center;
  `};
`;

export const NftItem = styled.div<{selected: boolean}>`
  display: flex;
  align-items: center;
  padding: 10px;
  margin: 5px 10px;
  border: 1px solid #EFEFEF;
  cursor: pointer;

  ${({ selected }) =>
    selected &&
    `
    color: #fff;
    background-color: #4710a3;
  `};
`;

export const NftName = styled.p`
  width: 200px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const TableContent = styled.div`
  position: relative;
  width: 100%;
  padding: 20px 0;
  background-color: #FEFEFE;
`;

export const Tabs = styled.div`
  display: flex;
  align-items: flex-end;
  border-bottom: 1px solid #808080;
`;

export const Tab = styled.div<{selected: boolean}>`
  width: 100%;
  max-width: 200px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #6B717F;
  margin-right: 20px;
  padding: 5px 0;
  border-bottom: 3px solid transparent;
  cursor: pointer;

  ${({ selected }) =>
    selected &&
    `
    color: #1A1A1A;
    border-bottom: 3px solid #752EEB;
  `};
`;

export const AddNFTBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  color: #752EEB;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  ${breakpoint.mobile`
    position: relative;
    margin-bottom: 20px;
  `};
`;
