export const state = {
    name: '',
    weather: '',
    temperature: '',
}

export async function getWeatherData(name) {
    try {
        const fetched = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=14785c3bbff74f0da9f125123231405&q=${name}&days=7`);
        const res = await Promise.race([fetched, timeout(10)]);
        const data = await res.json();
        return data;
    } catch(err) {
        throw 'error';
    }
}

function timeout(s) {
    return new Promise(function(_, reject) {
        setTimeout(() => {
            reject(new Error(`Request took too long! Timeout after ${s} second`));
        }, s * 1000);
    });
}