const API_URL = 'http://api.taiking.tw/TandemApi/';

const App = new Vue({
    el: '#YahooWeatherApp',
    mounted: function() {
        GetCityData(),
        GetWeatherForecastData()
    },
    data: {
        CitySelect: 2306179,
        CityOption: [],
        WeatherForecast: [],
        WeatherThead: [],
        WeatherTbody: [],
        WeekWeatherThead: [],
        WeekWeatherTbody: [],
        TableSwitch: false
    },
    methods: {
        WeatherBtn: function(){
            TableRemove();
            this.TableSwitch = true;
            GetWeatherData(this.CitySelect);
        },
        WeekWeatherBtn: function(){
            TableRemove();
            this.TableSwitch = true;
            GetWeekWeatherData(this.CitySelect);
        }
    }
})

/**
 * 取得城市資料
 * @returns {void}
 */
function GetCityData()
{
    axios.post(
        API_URL, 
        { ApiName: 'YahooWeatherCity' }
    ).then(function (Response) {
        if (Response.status == 200)
        {
            App.CityOption = Response.data.CityCode;
        }
    }).catch(function (Error) {
        console.log(Error);
    })
}

/**
 * 取得天氣預測代碼資料
 * @returns {void}
 */
function GetWeatherForecastData()
{
    axios.post(
        API_URL, 
        { ApiName: 'YahooWeatherForecast' }
    ).then(function (Response) {
            if (Response.status == 200)
            {
                App.WeatherForecast = Response.data.Forecast;
            }
    }).catch(function (Error) {
        console.log(Error);
    })
}


/**
 * 取得天氣資料
 * @param {number} CityCodes
 * @returns {void}
 */
function GetWeatherData(CityCodes)
{
    axios.post(
        API_URL, 
        { ApiName: 'YahooWeatherData', ApiData: { 'CityCode': CityCodes } }
    ).then(function (Response) {
        if(Response.status == 200)
        {
            let Data = Response.data[0];
            let DataTemp = Data.query.results.channel.item.condition.temp;
            let DataSpeed = Data.query.results.channel.wind.speed;
            let DataHumidity = Data.query.results.channel.atmosphere.humidity;
            let CelsiusTemp = CelsiusTempConvert(DataTemp);
            let BodyTemp = BodyTempConvert(DataSpeed, DataHumidity, CelsiusTemp);
            App.WeatherThead = GetWeatherThead();
            Data.query.results.channel.celsiustemp = CelsiusTemp;
            Data.query.results.channel.bodytemp = BodyTemp;
            App.WeatherTbody = Data.query.results;
        }
    }).catch(function (error) {
        console.log(error);
    })
}

/**
 * 取得未來一週天氣資料
 * @param {number} CityCodes
 * @returns {void}
 */
function GetWeekWeatherData(CityCodes)
{
    axios.post(
        API_URL, 
        { ApiName: 'YahooWeatherData', ApiData: { 'CityCode': CityCodes } }
    ).then(function (Response) {
        if (Response.status == 200)
        {
            let Data = Response.data[0];
            App.WeekWeatherThead = WeekWeatherThead();
            for (let i in Data.query.results.channel.item.forecast)
            {
                for (let j in App.WeatherForecast)
                {
                    let Forecast = Data.query.results.channel.item.forecast[i];
                    let High = CelsiusTempConvert(Forecast.high);
                    let Low = CelsiusTempConvert(Forecast.low);
                    let Week = GetWeekData();
                    let YDate = Forecast.date.split(' ');
                    let MonthData = GetMonthData();
                    let MonthName = '';
                    for (let Val in MonthData)
                    {
                        if (MonthData[Val].Code == YDate[1])
                        {
                            MonthName = (MonthData[Val].Name < 10) ? '0' + MonthData[Val].Name : MonthData[Val].Name;
                        }
                    }
                    let ToDate = YDate[2] + '-' + MonthName + '-' + YDate[0]
                    Forecast.ToDate = ToDate;
                    Forecast.MaxCelsiusTemp = High;
                    Forecast.MinCelsiusTemp = Low;
                    for (let Val in Week)
                    {
                        if(Forecast.day == Week[Val].Code)
                        {
                            Forecast.WeekName = Week[Val].Name;
                        }
                    }
                    if (Forecast.code == j)
                    {
                        Forecast.codeName = App.WeatherForecast[j];
                    }
                }
            }
            App.WeekWeatherTbody = Data.query.results.channel.item.forecast;
        }
    }).catch(function (Error) {
        console.log(Error);
    })
}

/**
 * 華氏轉攝氏
 * @param {number} DataTemp 華氏溫度
 * @returns {number} 
 */
function CelsiusTempConvert(DataTemp)
{
    //溫度轉換攝氏 = (溫度 - 32) * 5 / 9
    return Math.round((DataTemp - 32) * 5 / 9);
}

/**
 * 體感溫度轉換
 * @param {number} DataSpeed 風速
 * @param {number} DataHumidity 相對溼度
 * @param {number} CelsiusTemp 攝氏溫度
 * @returns {number}
 */
function BodyTempConvert(DataSpeed, DataHumidity, CelsiusTemp)
{
    //體感溫度= (1.07 * 氣溫) + (0.2 * 水氣壓) - (0.65 * 風速) - 2.7
    //水氣壓 = (相對濕度 / 100) * 6.105 * exp ((17.27 * 溫度) / (237.7 + 氣溫))
    //風速(英哩/時)轉(米/秒) = 四捨五入取第6位(風速 * 0.44704)
    let Pressure = (DataHumidity / 100) * 6.105 * Math.exp((17.27 * CelsiusTemp) / (237.7 + CelsiusTemp));
    let Pow = Math.pow(10, 6);
    let Speed = Math.round((DataSpeed * 0.44704) * Pow) / Pow;
    return Math.round((1.07 * CelsiusTemp) + Math.round(0.2 * Pressure) - (0.65 * Speed) - 2.7);
}

/**
 * 取得星期資料
 * @returns {Array.<Object.<string, string>>}
 */
function GetWeekData()
{
    return [
        { Code: 'Mon', Name: '星期一' },
        { Code: 'Tue', Name: '星期二' },
        { Code: 'Wed', Name: '星期三' },
        { Code: 'Thu', Name: '星期四' },
        { Code: 'Fri', Name: '星期五' },
        { Code: 'Sat', Name: '星期六' },
        { Code: 'Sun', Name: '星期日' },
    ];
}

/**
 * 取得月份名稱資料
 * @returns {Array.<Object.<string, string>>}
 */
function GetMonthData()
{
    return [
        { Code: 'January', Name: 1 },
        { Code: 'February', Name: 2 },
        { Code: 'March', Name: 3 },
        { Code: 'Apr', Name: 4 },
        { Code: 'May', Name: 5 },
        { Code: 'June', Name: 6 },
        { Code: 'July', Name: 7 },
        { Code: 'August', Name: 8 },
        { Code: 'September', Name: 9 },
        { Code: 'October', Name: 10 },
        { Code: 'November', Name: 11 },
        { Code: 'December', Name: 12 }
    ]
}

/**
 * 取得天氣標題
 * @returns {Array.<Object.<string, string>>}
 */
function GetWeatherThead()
{
    return [
        { Condition: '天氣狀況', Temp: '溫度', Humidity: '濕度', WindDirection: '風向', WindSpeed: '風速', BodyTemp: '體感溫度' }
    ]
}

/**
 * 取得一週未來天氣標題
 * @returns {Array.<Object.<string, string>>}
 */
function WeekWeatherThead()
{
    return [
        { Code: '預測代碼', CodeName: '預測天氣', Date: '日期', Day: '星期', High: '預測高溫(攝氏)', Low: '預測低溫(攝氏)', Text: '說明' }
    ]
}

/**
 * 表格移除
 * @returns {void}
 */
function TableRemove()
{
    App.TableSwitch = false;
    App.WeatherThead = [];
    App.WeatherTbody = [];
    App.WeekWeatherThead = [];
    App.WeekWeatherTbody = [];
}