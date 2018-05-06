/**
 * 使用API核心
 */
const UseCoreApp = new CoreApp();

const App = new Vue({
    el: '#THRSApp',
    mounted: function() {
        GetStationData(),
        GetCarTripsData()
    },
    data: {
        StationSelect: '0990',
        StationOption: [],
        StationDate: UseCoreApp.Shared.GetDate,
        StationTopSelect: 'all',
        StationTopOption: UseCoreApp.Shared.GetStationTop,
        DailyTimeTableThead: [],
        DailyTimeTableTbody: [],
        SpecifiedStartSelect: '0990',
        SpecifiedStartOption: [],
        SpecifiedEndSelect: '1070',
        SpecifiedEndOption: [],
        SpecifiedDate: UseCoreApp.Shared.GetDate,
        TimeSortSelect: 'asc',
        TimeSortOption: UseCoreApp.Shared.GetSort,
        SpecifiedTopSelect: 'all',
        SpecifiedTopOption: UseCoreApp.Shared.GetStationTop,
        DailyTimeTableSpecifiedThead: [],
        DailyTimeTableSpecifiedTbody: [],
        CarTripsSelect: '1218',
        CarTripsOption: [],
        CarTripsThead: [],
        CarTripsTbody: []
    },
    methods: {
        DailyTimetableBtn: function() {
            TableRemove();
            GetDailyTimetable(this.StationSelect, this.StationDate, this.StationTopSelect);
        },
        GeneralTimetableBtn: function() {
            TableRemove();
            GetDailyTimetableSpecified(this.SpecifiedStartSelect, this.SpecifiedEndSelect, this.SpecifiedDate, this.TimeSortSelect, this.SpecifiedTopSelect);
        },
        CarTripsBtn: function() {
            TableRemove();
            GetCarTrips(this.CarTripsSelect);
        }
    }
})

/**
 * 取得車站資料
 * @returns {void}
 */
function GetStationData()
{
    let StationApi = 'http://ptx.transportdata.tw/MOTC/v2/Rail/THSR/Station';
    axios.get(StationApi + '?$format=JSON').then(function (Response) {
        if (Response.status == 200) 
        {
            let Data = Response.data;
            let NewData;
            for (let i = 0; i < Data.length; i++)
            {
                for (let j = (i + 1); j < Data.length; j++)
                {
                    if (Data[i].StationID > Data[j].StationID)
                    {
                        NewData = Data[i];
                        Data[i] = Data[j];
                        Data[j] = NewData;
                    }
                }
            }
            App.StationOption = Response.data;
            App.SpecifiedStartOption = Response.data;
            App.SpecifiedEndOption = Response.data;
        }
    }).catch(function (Error) {
        console.log(Error);
    });
}

/**
 * 取得車次資料
 * @returns {void}
 */
function GetCarTripsData()
{
    let StationApi = 'http://ptx.transportdata.tw/MOTC/v2/Rail/THSR/GeneralTimetable';
    axios.get(StationApi + '?$format=JSON').then(function (Response) {
        if (Response.status == 200) 
        {
            App.CarTripsOption = Response.data;
        }
    }).catch(function (Error) {
        console.log(Error);
    });
}

/**
 * 取得車站時刻表
 * @param {string} TrainNo 車站編號
 * @param {string} Dates 時間 
 * @param {number} Top 顯示筆數
 * @returns {void}
 */
function GetDailyTimetable(StationID, Dates, Top)
{
    let SelectTop = (Top == 'all') ? '?' : '?$top=' + Top;
    let StationApi = 'http://ptx.transportdata.tw/MOTC/v2/Rail/THSR/DailyTimetable/Station';
    let URL = StationApi + '/' + StationID + '/' + Dates + SelectTop + '&$format=JSON';
    axios.get(URL).then(function (Response) {
        if (Response.status == 200) 
        {
            App.DailyTimeTableThead = DailyTimeTableTheadData();
            for (let Val in Response.data) 
            {
                let Data = Response.data[Val];
                Data.Direction = UseCoreApp.DirectionConvert(Data.Direction);
            }
            App.DailyTimeTableTbody = Response.data;
        }
    }).catch(function (Error) {
        console.log(Error);
    });
}

/**
 * 取得指定日期出發車次
 * @param {string} Start 起點站編號
 * @param {string} End 終點站編號
 * @param {string} Dates 時間
 * @param {string} Sort 排序
 * @param {number} Top 顯示筆數
 * @returns {void}
 */
function GetDailyTimetableSpecified(Start, End, Dates, Sort, Top)
{
    let SelectTop = (Top == 'all') ? '?' : '?$top=' + Top;
    let StationApi = 'http://ptx.transportdata.tw/MOTC/v2/Rail/THSR/DailyTimetable/';
    let URL = StationApi + 'OD/' + Start + '/to/' + End + '/' + Dates + SelectTop + '&$format=JSON';
    axios.get(URL).then(function (Response) {
        if (Response.status == 200) 
        {
            App.DailyTimeTableSpecifiedThead = DailyTimeTableSpecifiedTheadData();
            for (let Val in Response.data) 
            {
                let Data = Response.data[Val];
                let OriginStopArrivalTime = Data.OriginStopTime.ArrivalTime.split(':');
                let TimeNum = OriginStopArrivalTime[0] + OriginStopArrivalTime[1];
                let TimeInterval = UseCoreApp.TimeInterval(Data.OriginStopTime.DepartureTime, Data.DestinationStopTime.DepartureTime);
                Data.TimeNum = TimeNum;
                Data.TimeInterval = TimeInterval;
                Data.DailyTrainInfo.Direction = UseCoreApp.DirectionConvert(Data.DailyTrainInfo.Direction);
                Data.DailyTrainInfo.Note = (Data.DailyTrainInfo.Note == null || typeof Data.DailyTrainInfo.Note == 'object') ? '' : Data.DailyTrainInfo.Note;
            }
            if (Sort == 'asc')
            {
                UseCoreApp.TimeSort(Response.data, 'asc');
            }else{
                UseCoreApp.TimeSort(Response.data, 'desc');
            }
            console.log(Response.data);
            App.DailyTimeTableSpecifiedTbody = Response.data;
        }
    }).catch(function (Error) {
        console.log(Error);
    });
}

/**
 * 取得指定車次時刻表
 * @param {string} TrainNo 車站編號
 * @param {number} Top 顯示筆數
 * @returns {void}
 */
function GetCarTrips(TrainNo, Top)
{
    let StationApi = 'http://ptx.transportdata.tw/MOTC/v2/Rail/THSR/GeneralTimetable/';
    let URL = StationApi + 'TrainNo/' + TrainNo + '?&$format=JSON';
    axios.get(URL).then(function (Response) {
        if (Response.status == 200) 
        {
            App.CarTripsThead = CarTripsTheadData(); 
            App.CarTripsTbody = Response.data[0].GeneralTimetable.StopTimes;
        }
    })
    .catch(function (Error) {
        console.log(Error);
    });
}

/**
 * 指定車站時刻表表格標題
 * @returns {Array.<Object.<string, string>>}
 */
function DailyTimeTableTheadData()
{
    return [
        { TrainDate: '時刻表日期', StationID: '車站代號', StationName: '車站名稱', TrainNo: '車次代號', Direction: '順逆行', StartingStationID: '起點車站代號', StartingStationName: '起點車站名稱', EndingStationID: '終點車站代號', EndingStationName: '終點車站名稱', ArrivalTime: '到站時間', DepartureTime: '離站時間', UpdateTime: '本平台資料更新時間'}
    ]
}

/**
 * 指定日期車次表格標題
 * @returns {Array.<Object.<string, string>>}
 */
function DailyTimeTableSpecifiedTheadData()
{
    return [
        { StopSequence: '跑法站序', OriginStationID: '起點車站代碼', OriginStationName: '起點車站名稱', OriginArrivalTime: '起點到站時間', OriginDepartureTime: '起點離站時間', DestinationStationID: '終點點車站代碼', DestinationStationName: '終點站名稱', DestinationArrivalTime: '終點到站時間', DestinationDepartureTime: '終點離站時間', TrainNo: '車次代碼', TimeInterval: '行車時間', Direction: '行駛方向', Note: '附註說明' }
    ]
}

/**
 * 指定車次時刻表表格標題
 * @returns {Array.<Object.<string, string>>}
 */
function CarTripsTheadData()
{
    return [
        { StopSequence: '跑法站序', StationID: '車站代碼', StationName: '車站名稱', ArrivalTime: '到站時間', DepartureTime: '離站時間' }
    ]
}

/**
 * 表格清除
 * @returns {void}
 */
function TableRemove() 
{
    App.DailyTimeTableThead = [];
    App.DailyTimeTableTbody = [];
    App.DailyTimeTableSpecifiedThead = [];
    App.DailyTimeTableSpecifiedTbody = [];
    App.CarTripsThead = [];
    App.CarTripsTbody = [];
}