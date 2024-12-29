import React from 'react';

import SaveIcon from '@icon/SaveIcon';

const Save = () => {

  return (
    <a
      className={`flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white text-sm mb-2 flex-shrink-0 border border-white/20 transition-opacity cursor-pointer opacity-100`}
      onClick={() => {

        fetch('sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: localStorage.getItem('free-chat-gpt')
        });
      }}
      title={''}
    >
      {(
        <>
          <SaveIcon />
        </>
      )}
    </a>
  );
};

export default Save;