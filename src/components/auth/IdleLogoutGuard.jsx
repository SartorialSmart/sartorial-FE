import useIdleLogout from "../../hooks/useIdleLogout";

/**
 * Mounts the 15-minute idle-timeout watcher. Must live inside <Router>.
 * Renders nothing — see useIdleLogout for the mechanics.
 */
const IdleLogoutGuard = () => {
  useIdleLogout();
  return null;
};

export default IdleLogoutGuard;
