import '../scss/index.scss';
import * as model from './model.js';
import view from './view.js';

async function controlWeather(name) {
    try {
        const data = await model.getWeatherData(name);
        view.renderSpinner();
        view.updateWeather(data);
        view.renderForecastH(data)
        view.updateDetails(data);
        view.renderForecastD(data);
    } catch(err) {
        view.renderError();
    } finally {
        view.removeSpinner();
    }
}

function init() {
    controlWeather('Rome');
    view.viewHandler(controlWeather);
}

init();
