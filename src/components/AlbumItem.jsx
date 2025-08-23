import React, { memo } from "react";
import OptimizedImage from "./OptimizedImage";

const AlbumItem = ({ title, subtitle, imageUrl, onClick = () => {} }) => {
  return (
    <button
      type="button"
      className="cursor-pointer flex flex-col items-center bg-white rounded-xl shadow-md p-4 transition-transform hover:scale-105 w-full h-auto md:w-[144px] md:h-[200px]"
      onClick={onClick}
    >
      <OptimizedImage
        src={imageUrl}
        alt={title}
        className="rounded-lg mb-2 object-cover w-full h-auto md:w-[144px] md:h-[144px]"
        width={144}
        height={144}
        priority={false}
        style={{ transition: 'transform 0.2s' }}
      />
      <div className="flex flex-col items-center mt-2">
        <div className="font-semibold text-base text-gray-800">{title}</div>
        <div className="text-sm text-gray-500">{subtitle}</div>
      </div>
    </button>
  );
};

export default memo(AlbumItem);
