// components/permissions/PermissionPicker.jsx
// Module/action permission picker shared by the Team page and the Staff list.
// Each permission is stored as `${module}.${action}`.

import { Checkbox } from "antd";
import PropTypes from "prop-types";

const PermissionPicker = ({ catalog, value, onChange }) => {
  const selected = new Set(value);

  const toggle = (perm, checked) => {
    const next = new Set(selected);
    if (checked) next.add(perm);
    else next.delete(perm);
    onChange([...next]);
  };

  const toggleModule = (mod, checked) => {
    const next = new Set(selected);
    mod.actions.forEach((action) => {
      const perm = `${mod.module}.${action}`;
      if (checked) next.add(perm);
      else next.delete(perm);
    });
    onChange([...next]);
  };

  if (!Array.isArray(catalog) || catalog.length === 0) {
    return <p className="text-sm text-gray-500">No permissions available.</p>;
  }

  return (
    <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
      {catalog.map((mod) => {
        const perms = mod.actions.map((action) => `${mod.module}.${action}`);
        const allOn = perms.every((p) => selected.has(p));
        return (
          <div key={mod.module} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold capitalize text-slate-800">
                {String(mod.module).replace("_", " ")}
              </span>
              <Checkbox checked={allOn} onChange={(e) => toggleModule(mod, e.target.checked)}>
                <span className="text-xs text-slate-500">All</span>
              </Checkbox>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {mod.actions.map((action) => {
                const perm = `${mod.module}.${action}`;
                return (
                  <Checkbox
                    key={perm}
                    checked={selected.has(perm)}
                    onChange={(e) => toggle(perm, e.target.checked)}
                  >
                    <span className="text-xs capitalize">{String(action).replace(/_/g, " ")}</span>
                  </Checkbox>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

PermissionPicker.propTypes = {
  catalog: PropTypes.array,
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PermissionPicker;
