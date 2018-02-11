import { connect } from '../StateProvider';
import { Download, StateContainer } from '../../core/State';

export interface DownloadProgressProps {
  download?: Download;
}

export function DownloadProgress({ download }: DownloadProgressProps) {
  if (!download) {
    return null;
  }

  console.log(`Download progress: ${(download.bytes / download.file.size * 100).toFixed(2)}%`);

  return null;
}

const mapStateToProps = (state: StateContainer): DownloadProgressProps => ({
  download: state.getState().currentDownload
});

export const DownloadProgressContainer = connect<DownloadProgressProps, {}>(mapStateToProps)(DownloadProgress);