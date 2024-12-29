import React from 'react';

const SaveIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3 w-3"
    height="1em"
    width="1em"
  >
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11.17a2 2 0 011.41.59l3.83 3.83a2 2 0 01.59 1.41V19a2 2 0 01-2 2z"></path>
    <path d="M17 21v-8H7v8"></path>
    <path d="M7 3v5h8V3"></path>
  </svg>
  );
};

export default SaveIcon;