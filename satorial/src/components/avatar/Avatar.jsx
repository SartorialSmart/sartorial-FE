import PropTypes from "prop-types";

const Avatar = ({ src, alt }) => {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-700">
            {alt?.[0] || "U"}
          </div>
        )}
      </div>
    );
  };

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
};

  export default Avatar;
  