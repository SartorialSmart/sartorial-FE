export default function FabricsContent() {
  return (
    <div>
      <h2 className="text-2xl font-medium">Fabrics</h2>
      <hr className="mb-6 mt-2" />

      {/* Upload Section */}
      <div className="mb-8">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
          <div className="flex flex-col items-center justify-center py-6">
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-500 text-sm mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-gray-400 text-xs mb-4">
              SVG, PNG, JPG or GIF (max. 800x400px)
            </p>
            <button className="bg-[#E3ECFF] text-blue-600 px-4 py-2 rounded-md text-sm font-medium">
              Select File
            </button>
          </div>
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="image/*"
          />
        </div>
      </div>

      {/* Existing Grid Section */}
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div key={index}>
            <p className="text-sm font-medium text-gray-700 mb-2 text-left">
              Fabric {index}
            </p>
            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
              <img
                src={`/src/assets/images/fabric/fabric${index}.jpg`}
                alt={`Fabric ${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
