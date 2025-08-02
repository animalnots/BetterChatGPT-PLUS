import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import Toggle from '@components/Toggle';

const AutoScrollToggle = () => {
  const { t } = useTranslation();

  const setAutoScroll = useStore((state) => state.setAutoScroll);

  const [isChecked, setIsChecked] = useState<boolean>(
    useStore.getState().autoScroll
  );

  useEffect(() => {
    setAutoScroll(isChecked);
  }, [isChecked]);

  return (
    <Toggle
      label={t('autoScroll') as string}
      isChecked={isChecked}
      setIsChecked={setIsChecked}
    />
  );
};

export default AutoScrollToggle;