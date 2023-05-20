class View {
    _data;
    _currentUnit;
    _week = {
        0: 'Sunday',
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
    };

    constructor() {
        this._changeTheme();
        this._changeUnit();
    }

    viewHandler(handler) {
        document.querySelector('.search__submit').addEventListener('click', function(e) {
            e.preventDefault();
            const input = document.querySelector('input');
            handler(input.value);
            input.value = '';
            input.blur();
        });
    }

    updateWeather(data) {
        this._data = data;
        this._currentUnit = document.querySelector('.selected').textContent.at(-1);
        document.querySelector('.weather__location').textContent = data.location.name;
        document.querySelector('.weather__descr').textContent = data.current.condition.text;
        document.querySelector('.weather__temperature').textContent = Math.round(this._currentUnit === 'C'  ? data.current.temp_c : data.current.temp_f) + '°' + this._currentUnit;
        document.querySelector('.weather__date').textContent = data.location.localtime.split(' ')[0];
        document.querySelector('.weather__time').textContent = data.location.localtime.split(' ')[1];
        this._updateTime(data);
    }

    renderForecastH(data) {
        this._data = data;
        const markup = this._generateMarkupForecastH();
        document.querySelector('.forecast-h').innerHTML = markup;
    }

    renderForecastD(data) {
        this._data = data;
        const markup = this._generateMarkupForecastD();
        document.querySelector('.forecast-d__list').innerHTML = markup;
    }

    updateDetails(data) {
        const info = [
            data.forecast.forecastday[0].astro.sunrise.slice(0, -2),
            data.forecast.forecastday[0].astro.sunset.slice(0, -2).split(':')[0] - 0 + 12 + ':' + data.forecast.forecastday[0].astro.sunset.slice(0, -2).split(':')[1],
            data.forecast.forecastday[0].day.daily_chance_of_rain + '%',
            data.current.humidity + '%',
            data.current.wind_dir + ' '  + data.current.wind_kph + 'kph',
            (this._currentUnit === 'C' ? data.current.feelslike_c : data.current.feelslike_f) + '°' + this._currentUnit,
            data.current.precip_mm + 'cm',
            data.current.pressure_mb  + 'hPa',
            data.current.vis_km + 'km',
            data.current.uv,
        ];
        document.querySelectorAll('.details__item').forEach((el, i) => {
            el.querySelector('.details__info').textContent = info[i];
        })
    }


    renderError() {
        this._hide();
        const markup = `<div class="error">That city doesn't exist, try another</div>`;
        document.querySelector('header').insertAdjacentHTML('afterend', markup);
        document.querySelector('.loader').remove();
    }

    renderSpinner() {
        document.querySelector('.error')?.remove();
        this._hide();
        const markup = `<div class="loader"></div>`;
        document.querySelector('header').insertAdjacentHTML('afterend', markup);
    }

    removeSpinner() {
        setTimeout(() => {
            document.querySelector('main').style.opacity = '100';
            document.querySelector('main').style.visibility = 'visible';
            document.querySelector('.loader')?.remove();
        }, 1000);
    }

    _hide() {
        document.querySelector('main').style.opacity = '0';
        document.querySelector('main').style.visibility = 'hidden';
    }

    _updateTime(data) {
        setInterval(() => {
            const time = new Date(Date.now()).toLocaleString('de-DE', {
                timeZone: data.location.tz_id,
              }).toString();
            document.querySelector('.weather__time').textContent = time.split(' ')[1].slice(0, -3)
        }, 60000);
    }
    
    _changeTheme() {
        document.querySelector('.theme').addEventListener('click', function (e) {
            const btn = e.target.closest('.theme__btn');
            if (!btn) return;
            const ball = document.querySelector('.theme__ball');
            const body = document.querySelector('body');

            // Add dark theme
            if (btn.classList.contains('sun')) {
                ball.style.transform = 'translate(1rem, -50%)';
                body.classList.add('theme-dark');
            }

            // Remove dark theme
            if (btn.classList.contains('moon')) {
                ball.style.transform = 'translate(5.5rem, -50%)';
                body.classList.remove('theme-dark');
            }
            
        });
    }

    _changeUnit() {
        document.querySelector('.weather__btn-container').addEventListener('click', function(e) {
            const btn = e.target;
            const allDom =  document.querySelectorAll('*');
            
            // Change unit to C
            if (btn.id === 'temperatureUnitC' && !btn.classList.contains('selected')) {
                this._currentUnit = 'C'
                btn.classList.add('selected');
                document.querySelector('#temperatureUnitF').classList.remove('selected');
                allDom.forEach(el => {
                    if (el.firstChild?.nodeValue?.toString().at(-2) === '°' && !el.classList.contains('weather__btn')) {
                        const elArr = el.textContent.split('°');
                        el.textContent = Math.round((elArr[0] - 32) / 1.8) + '°C';
                    }
                });
            }

            // Change unit to F
            if (btn.id === 'temperatureUnitF'  && !btn.classList.contains('selected')) {
                this._currentUnit = 'F'
                btn.classList.add('selected');
                document.querySelector('#temperatureUnitC').classList.remove('selected');
                allDom.forEach(el => {
                    if (el.firstChild?.nodeValue?.toString().at(-2) === '°' && !el.classList.contains('weather__btn')) {
                        const elArr = el.textContent.split('°');
                        el.textContent = Math.round((elArr[0] * 1.8) + 32) + '°F';
                    }
                });
            }
        });
    }

    _generateMarkupForecastD() {
        return [
            `<li class="forecast-d__item-headings">
                <p class="heading-tertiary">Day</p>
                <div></div>
                <p class="heading-tertiary">CHANCE OF RAIN</p>
                <p class="heading-tertiary">HUMIDITY</p>
                <p class="heading-tertiary">TEMPERATURE</p>
            </li>`
        ].concat(this._data.forecast.forecastday.map(el => {
            return `
            <li class="forecast-d__item">
                <p class="forecast-d__info">${this._week[new Date(el.date).getDay()]}</p>
                <div class="forecast-d__img"><img class="img" src="${el.day.condition.icon}" alt="Week icon"></div>
                
                <p class="forecast-d__info">${el.day.daily_chance_of_rain}%</p>
                <p class="forecast-d__info">${el.day.avghumidity}%</p>
                <p class="forecast-d__info">${this._currentUnit === 'C' ? el.day.avgtemp_c : el.day.avgtemp_f}°${this._currentUnit}</p>
            </li>
            `
        })).join('');
    }

    _generateMarkupForecastH() {
        return this._data.forecast.forecastday.find(day => this._data.current.last_updated.split(' ')[0] === day.date).hour.map(el => {
            return `
            <li class="forecast-h__item">
                <span class="forecast-h__hour">${el.time.split(' ')[1].slice(0, 2)}</span>
                <img class="forecast-h__img" src="${el.condition.icon}" alt="weather icon">
                <span class="forecast-h__temperature">${this._currentUnit === 'C' ? Math.round(el.temp_c) : Math.round(el.temp_f)}°${this._currentUnit}</span>
            </li>`
        }).join('');
    }
}

export default new View();
