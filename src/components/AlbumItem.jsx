import React from "react";

const AlbumItem = ({ title, subtitle, imageUrl, onClick = () => {} }) => {
  return (
    <button
      type="button"
      className="cursor-pointer flex flex-col items-center bg-white rounded-xl shadow-md p-4 transition-transform hover:scale-105"
      style={{ width: 144, height: 200 }}
      onClick={onClick}
    >
      <img
        src={imageUrl}
        alt={title}
        className="rounded-lg mb-2 object-cover"
        style={{ width: 144, height: 144, transition: 'transform 0.2s' }}
      />
      <div className="flex flex-col items-center mt-2">
        <div className="font-semibold text-base text-gray-800">{title}</div>
        <div className="text-sm text-gray-500">{subtitle}</div>
      </div>
    </button>
  );
};

export default AlbumItem;
