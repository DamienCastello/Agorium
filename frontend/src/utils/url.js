const getBaseUrl = () => {
  return window.environment.VITE_BASE_URL;
};

const getBackPort = () => {
  return window.environment.VITE_PORT_BACK;
};

const getFrontPort = () => {
  return window.environment.VITE_PORT_FRONT;
};

export default {
  baseUrl: getBaseUrl(),
  portBack: getBackPort(),
  portFront: getFrontPort()
};