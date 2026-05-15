import React from "react";

export const Button = ({ children, className = "", ...props }: any) => {
  return (
    <button
      className={`px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};