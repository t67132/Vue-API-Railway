/**
 * API核心
 * 
 * @description GetDate 取得日期
 * @description GetStationTop 取得顯示筆數
 */
function CoreApp()
{
    /**
     * @public 公開
     * @static 模擬靜態
     * @description GetDate 取得日期
     * @description GetStationTop 取得顯示筆數
     * @description GetTimeSortData 取得時間排序資料
     */
    this.Shared = {
        GetDate: this.GetDate(),
        GetStationTop: this.GetStationTop(),
        GetSort: this.GetTimeSortData()
    }
}

/**
 * 取得日期
 * @returns {string}
 */
CoreApp.prototype.GetDate = function ()
{
    let Dates = new Date();
    let Year = Dates.getFullYear();
    let Month = Dates.getMonth() + 1;
    let Day = Dates.getDate();
    Month = (Month < 9) ? '0' + Month : Month;
    Day = (Day < 9) ? '0' + Day : Day;
    return Year + '-' + Month + '-' + Day;
}

/**
 * 取得顯示筆數
 * @returns {Array.<Object.<string, string>>}
 */
CoreApp.prototype.GetStationTop = function ()
{
    return [
        { Num: 10, Name: 10 },
        { Num: 20, Name: 20 },
        { Num: 30, Name: 30 },
        { Num: 'all', Name: '全部' }
    ]
}

/**
 * 取得時間排序資料
 * @returns {Array.<Object.<string, string>>}
 */
CoreApp.prototype.GetTimeSortData = function()
{
    return [
        { Name: '依時間由小到大', Val: 'asc' },
        { Name: '依時間由大到小', Val: 'desc' }
    ]
}

/**
 * 順逆行轉換
 * @param {string} Direction 順逆行代碼
 * @returns {string}
 */
CoreApp.prototype.DirectionConvert = function (Direction)
{
    return (Direction) ? '順行' : '逆行';
}

/**
 * 山海線類型轉換
 * @param {string} TripLine 山海線類型代碼
 * @returns {string}
 */
CoreApp.prototype.TripLineConvert = function (TripLine)
{
    let TripLineName = '';
    switch (TripLine)
    {
        case 0:
            TripLineName = '不經山海線';
        break;
        case 1:
            TripLineName = '山線';
        break;
        case 2:
            TripLineName = '海線';
        break;
        default:
        break;
    }
    return TripLineName;
}

/**
 * 是或否轉換
 * @param {boolean} Bool 是或否
 * @returns {string}
 */
CoreApp.prototype.YesNoConvert = function (Bool)
{
    return (Bool) ? '是' : '否';
}

/**
 * 時間排序
 * @param {Array.<Object.<string, string>>} Data 時間排序
 * @param {string} Sort 排序方式
 * @returns {Array.<Object.<string, string>>}
 */
CoreApp.prototype.TimeSort = function (Data, Sort)
{
    let Count = Data.length;
    let NewData;
    for (let i = 0; i < Count; i++)
    {
        for (let j = (i + 1); j < Count; j++)
        {
            if (Sort == 'asc')
            {
                if (Data[i].TimeNum > Data[j].TimeNum)
                {
                    NewData = Data[i];
                    Data[i] = Data[j];
                    Data[j] = NewData;
                }
            }else{
                if (Data[i].TimeNum < Data[j].TimeNum)
                {
                    NewData = Data[i];
                    Data[i] = Data[j];
                    Data[j] = NewData;
                }
            }
        }
    }
    return Data;
}

/**
 * 行車時間
 * @param {number} StartTime 起始時間
 * @param {number} EndTime 抵達時間
 * @returns {string}
 */
CoreApp.prototype.TimeInterval = function (StartTime, EndTime)
{
    let OriginStopDepartureTime = StartTime.split(':');
    let OriginStopDepartureTimeNumber = (OriginStopDepartureTime[0] * 60 * 60) + (OriginStopDepartureTime[1] * 60);
    let DestinationStopDepartureTime = EndTime.split(':');
    let DestinationStopDepartureTimeNumber = (DestinationStopDepartureTime[0] * 60 * 60) + (DestinationStopDepartureTime[1] * 60);
    let TimeHourConvert = ((DestinationStopDepartureTimeNumber - OriginStopDepartureTimeNumber) > 0) ? DestinationStopDepartureTimeNumber - OriginStopDepartureTimeNumber : (DestinationStopDepartureTimeNumber + (24 * 60 * 60)) - OriginStopDepartureTimeNumber;
    let TimeConvert = new Number(TimeHourConvert / 60 / 60).toFixed(2);
    let TimeSplit = TimeConvert.split('.');
    let HourConvert = TimeSplit[0];
    let MinuteConvert = Math.round((TimeSplit[1] / 100) * 60);
    return ((HourConvert < 10) ? '0' + HourConvert : HourConvert) + ':' + ((MinuteConvert < 10) ? '0' + MinuteConvert : MinuteConvert);
}