const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const getAvatarUrl = ({ name, background, color,
    fontsize = 0.33, size = 30, format = 'svg',
    bold, rounded, length, uppercase }) => {
    const resolveSettings = (key, setting) => {
        if (!setting) return "";
        return `${key}=${setting}&`;
    }
    let apiURL = `https://ui-avatars.com/api/?`;
    apiURL += resolveSettings("name", name);
    apiURL += resolveSettings("background", background);
    apiURL += resolveSettings("color", color);
    apiURL += resolveSettings("size", size);
    apiURL += resolveSettings("font-size", fontsize);
    apiURL += resolveSettings("length", length);
    apiURL += resolveSettings("rounded", rounded);
    apiURL += resolveSettings("bold", bold);
    apiURL += resolveSettings("uppercase", uppercase);
    apiURL += resolveSettings("format", format);
    return apiURL;
}

export { getRandomColor, getAvatarUrl }