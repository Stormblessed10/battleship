import '../scss/index.scss';
import * as model from './model.js';
import view from './view.js';

async function controlWeather(name) {
    try {
        const data = await model.getWeatherData(name);
        console.log(data)
        view.renderSpinner();
        view.updateWeather(data);
        view.renderForecastH(data)
        view.updateDetails(data);
        view.renderForecastD(data);
        view.removeSpinner();
    } catch(err) {
        view.renderError();
    }
}

function init() {
    controlWeather('Rome');
    view.viewHandler(controlWeather);
}

init();
