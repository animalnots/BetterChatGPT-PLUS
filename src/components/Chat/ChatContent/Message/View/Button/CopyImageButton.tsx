import React, { useState } from 'react';
import BaseButton from './BaseButton';
import { useTranslation } from 'react-i18next';
import CopyIcon from '@icon/CopyIcon';
import TickIcon from '@icon/TickIcon';
import { toast } from 'react-toastify';

const CopyImageButton = ({
  onClick,
  imageUrl,
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  imageUrl: string;
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyImageToClipboard = async (url: string) => {
    try {
      // If it's a data URL or local URL, fetch and copy as image
      if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
        const response = await fetch(url);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
      } else {
        // For external URLs, copy as text
        await navigator.clipboard.writeText(url);
      }
      return true;
    } catch (error) {
      console.error('Failed to copy image:', error);
      // Fallback to copying URL if image copy fails
      await navigator.clipboard.writeText(url);
      return true;
    }
  };

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick(e);
    const success = await copyImageToClipboard(imageUrl);
    if (success) {
      setCopied(true);
      toast.success(t('copied') as string, { autoClose: 1000 });
      setTimeout(() => setCopied(false), 1000);
    }
  };

  return (
    <BaseButton
      onClick={handleClick}
      icon={copied ? <TickIcon /> : <CopyIcon />}
      buttonProps={{
        'aria-label': 'copy image',
        className:
          'absolute top-2 right-2 p-1 rounded-md bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity',
      }}
    />
  );
};

export default CopyImageButton;
