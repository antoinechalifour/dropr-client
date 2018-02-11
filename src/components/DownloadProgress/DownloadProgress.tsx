import * as React from 'react';
import styled from 'styled-components';
import { connect } from '../StateProvider';
import { Download, StateContainer } from '../../core/State';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .24);
  background: #fff;
  font-size: 80%;
`;

const FileName = styled.div``;

const ProgressWrapper = styled.div`
  position: relative;
  height: 10px;
  flex: 1;
  margin-left: 12px;
  margin-right: 12px;
  border-radius: 4px;
  background: #8ACFF2;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: #5C8AC3;
  transition: width .1s ease;
`;

const ProgressValue = styled.div`
  font-family: monospace;
  text-align: right;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
`;

export interface DownloadProgressProps {
  download?: Download;
}

export function DownloadProgress({ download }: DownloadProgressProps) {
  if (!download) {
    return null;
  }

  const percent = download.bytes / download.file.size * 100;

  return (
    <Wrapper>
      <FileName>{download.file.name}</FileName>
      <ProgressWrapper>
        <ProgressBar style={{ width: `${percent}%` }} />
      </ProgressWrapper>
      <ProgressValue>{percent.toFixed(2)}%</ProgressValue>
    </Wrapper>
  );
}

const mapStateToProps = (state: StateContainer): DownloadProgressProps => ({
  download: state.getState().currentDownload
});

export const DownloadProgressContainer = connect<DownloadProgressProps, {}>(mapStateToProps)(DownloadProgress);