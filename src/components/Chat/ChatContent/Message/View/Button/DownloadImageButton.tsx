import React, { useState } from 'react';
import BaseButton from './BaseButton';
import { useTranslation } from 'react-i18next';
import DownloadIcon from '@icon/DownloadIcon';
import TickIcon from '@icon/TickIcon';
import { toast } from 'react-toastify';

const DownloadImageButton = ({
  imageUrl,
}: {
  imageUrl: string;
}) => {
  const { t } = useTranslation();
  const [downloaded, setDownloaded] = useState(false);

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create temporary link and click it
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Extract filename from URL or use timestamp
      const filename = url.split('/').pop()?.split('?')[0] || `image-${Date.now()}.png`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl);
      return true;
    } catch (error) {
      console.error('Failed to download image:', error);
      return false;
    }
  };

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const success = await downloadImage(imageUrl);
    if (success) {
      setDownloaded(true);
      toast.success(t('downloaded') as string, { autoClose: 1000 });
      setTimeout(() => setDownloaded(false), 1000);
    } else {
      toast.error(t('errors.failedToDownload') as string, { autoClose: 2000 });
    }
  };

  return (
    <BaseButton
      onClick={handleClick}
      icon={downloaded ? <TickIcon /> : <DownloadIcon />}
      buttonProps={{
        'aria-label': 'download image',
        className:
          'absolute top-2 right-12 p-1 rounded-md bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity',
      }}
    />
  );
};

export default DownloadImageButton;
