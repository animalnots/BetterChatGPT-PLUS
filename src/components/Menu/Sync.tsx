import React from 'react';

import RefreshIcon from '@icon/RefreshIcon';

const Sync = () => {

  return (
    <a
      className={`flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white text-sm mb-2 flex-shrink-0 border border-white/20 transition-opacity cursor-pointer opacity-100`}
      onClick={() => {
        fetch('sync', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })
        .then(response => response.json())
        .then(response => {
          // set new data
          localStorage.setItem('free-chat-gpt', JSON.stringify(response));

          // reload
          location.reload();
        });
      }}
      title={''}
    >
      {(
        <>
          <RefreshIcon />
        </>
      )}
    </a>
  );
};

export default Sync;