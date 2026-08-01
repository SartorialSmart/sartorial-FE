import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { MapPin } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import LocationService from "../../services/LocationService";

const LocationFilter = ({ value, onChange, label = "Location", allLabel = "All Locations", className = "", hideLabel = false, leadingIcon = false, selectClassName = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" }) => {
  const { user } = useAuth();
  const isAdmin = ["super_admin", "admin", "organization"].includes(user?.role?.toLowerCase());
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    let active = true;
    LocationService.listLocations()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : data?.results || [];
        setLocations(list);
        if (!isAdmin) {
          onChange(user?.location || "");
        }
      })
      .catch(() => {
        // Locations unavailable; staff still fall back to their profile location.
        if (!isAdmin) {
          onChange(user?.location || "");
        }
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, user?.location]);

  if (!isAdmin) {
    const current = locations.find((loc) => String(loc.id) === String(user?.location));
    return (
      <div className={className}>
        {!hideLabel && (
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            <MapPin size={13} className="inline mr-1.5" />
            {label}
          </label>
        )}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
          <MapPin size={15} className="text-gray-400" />
          {current?.name || "Your location"}
        </div>
      </div>
    );
  }

  const selectElement = (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value || "")}
      className={selectClassName}
    >
      <option value="">{allLabel}</option>
      {locations.map((loc) => (
        <option key={loc.id} value={loc.id}>
          {loc.name}
        </option>
      ))}
    </select>
  );

  return (
    <div className={className}>
      {!hideLabel && (
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          <MapPin size={13} className="inline mr-1.5" />
          {label}
        </label>
      )}
      {leadingIcon ? (
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          {selectElement}
        </div>
      ) : (
        selectElement
      )}
    </div>
  );
};

LocationFilter.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  allLabel: PropTypes.string,
  className: PropTypes.string,
  hideLabel: PropTypes.bool,
  leadingIcon: PropTypes.bool,
  selectClassName: PropTypes.string,
};

export default LocationFilter;
