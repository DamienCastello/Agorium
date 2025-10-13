const getFrontUrl = () => {
  // run with docker compose
  if (window.environment.VITE_SERVER_NAME) {
    return window.environment.VITE_SERVER_NAME;
  }

  // run without docker
  return `http://localhost:5173`;
}

const getBaseUrl = () => {
  // run with docker compose
  if (window.environment.VITE_BACKEND_URL) {
    return window.environment.VITE_BACKEND_URL;
  }
  
  // run without docker
  return `http://localhost:3000`;
};

const getBackPort = () => {
  return window.environment.VITE_PORT_BACK;
};

const getFrontPort = () => {
  return window.environment.VITE_PORT_FRONT;
};

export default {
  frontUrl: getFrontUrl(),
  baseUrl: getBaseUrl(),
  portBack: getBackPort(),
  portFront: getFrontPort()
};