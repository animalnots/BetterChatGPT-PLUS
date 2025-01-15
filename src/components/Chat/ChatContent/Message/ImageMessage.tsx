import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  url: string;
  alt: string;
}

const ImageMessage: React.FC<Props> = ({ url, alt }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-[800px] overflow-hidden rounded-lg">
      <img 
        src={url} 
        alt={alt} 
        className="w-full h-auto object-contain"
        loading="lazy"
      />
    </div>
  );
};

export default ImageMessage;
