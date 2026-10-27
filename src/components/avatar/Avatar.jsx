import PropTypes from "prop-types";
import { User } from "lucide-react";

const Avatar = ({ src, alt }) => {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <User className="w-6 h-6 text-gray-500" />
        )}
      </div>
    );
  };

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
};

  export default Avatar;
  