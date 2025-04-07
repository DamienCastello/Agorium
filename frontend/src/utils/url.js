const getBaseUrl = () => {
    // Vérifie l'environnement et renvoie la base URL correspondante
    if (process.env.NODE_ENV === 'production') {
        return process.env.BASE_URL;
    } else if (process.env.NODE_ENV === 'pre-prod') {
        return process.env.BASE_URL;
    }
    // Par défaut, pour dev
    return process.env.BASE_URL;
};

const getBackPort = () => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.PORT_BACK;
    } else if (process.env.NODE_ENV === 'pre-prod') {
        return process.env.PORT_BACK;
    }
    return process.env.PORT_BACK;
};

const getFrontPort = () => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.PORT_FRONT;
    } else if (process.env.NODE_ENV === 'pre-prod') {
        return process.env.PORT_FRONT;
    }
    return process.env.PORT_FRONT;
};

export default {
    baseUrl: getBaseUrl(),
    portBack: getBackPort(),
    portFront: getFrontPort()
};
