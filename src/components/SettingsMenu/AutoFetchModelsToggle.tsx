import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import { initializeModels } from '@constants/modelLoader';
import Toggle from '@components/Toggle/Toggle';

const AutoFetchModelsToggle = () => {
  const { t } = useTranslation();
  const setAutoFetchModels = useStore((state) => state.setAutoFetchModels);
  
  const [isChecked, setIsChecked] = useState<boolean>(
    useStore.getState().autoFetchModels
  );

  useEffect(() => {
    setAutoFetchModels(isChecked);
    // Re-initialize models with the new setting
    initializeModels(isChecked);
  }, [isChecked]);

  return (
    <Toggle
      label={t('Auto-fetch models from OpenRouter on start') as string}
      isChecked={isChecked}
      setIsChecked={setIsChecked}
    />
  );
};

export default AutoFetchModelsToggle;
