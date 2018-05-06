/**
 * 使用API核心
 */
const UseCoreApp = new CoreApp();

const App = new Vue({
    el: '#TRAApp',
    mounted: function() {
        GetStationData();
        GetCarTripsData();
        GetLineAreaData();
        GetLineStationData();
    },
    data: {
        StationSelect: 1008,
        StationOption: [],
        StationDate: UseCoreApp.Shared.GetDate,
        StationTopSelect: 'all',
        StationTopOption: UseCoreApp.Shared.GetStationTop,
        DailyTimeTableThead: [],
        DailyTimeTableTbody: [],
        StartLineAreaSelect: 0,
        StartLineAreaOption: [],
        SpecifiedStartSelect: 1001,
        SpecifiedStartOption: [],
        EndLineAreaSelect: 10,
        EndLineAreaOption: [],
        SpecifiedEndSelect: 1238,
        SpecifiedEndOption: [],
        SpecifiedDate: UseCoreApp.Shared.GetDate,
        TrainTypeSelect: 0,
        TrainTypeOption: TrainTypeData(),
        TimeSortSelect: 'asc',
        TimeSortOption: UseCoreApp.Shared.GetSort,
        SpecifiedTopSelect: 'all',
        SpecifiedTopOption: UseCoreApp.Shared.GetStationTop,
        DailyTimeTableSpecifiedThead: [],
        DailyTimeTableSpecifiedTbody: [],
        CarTripsSelect: 1101,
        CarTripsOption: [],
        CarTripsThead: [],
        CarTripsTbody: [],
        TableSwitch: false
    },
    watch:{
        StartLineAreaSelect: function() {
            for (let i in this.SpecifiedStartOption)
            {
                if (i == this.StartLineAreaSelect)
                {
                    let Keys = Object.keys(this.SpecifiedStartOption[i].station)[0];
                    this.SpecifiedStartSelect = Keys;
                }
            }
        },
        EndLineAreaSelect: function() {
            for (let i in this.SpecifiedEndOption)
            {
                if (i == this.EndLineAreaSelect)
                {
                    let Keys = Object.keys(this.SpecifiedEndOption[i].station)[0];
                    this.SpecifiedEndSelect = Keys;
                }
            }
        }
    },
    methods: {
        DailyTimetableBtn: function () {
            TableRemove();
            this.TableSwitch = true;
            GetDailyTimetable(this.StationSelect, this.StationDate, this.StationTopSelect);
        },
        GeneralTimetableBtn: function () {
            TableRemove();
            this.TableSwitch = true;
            GetDailyTimetableSpecified(this.SpecifiedStartSelect, this.SpecifiedEndSelect, this.SpecifiedDate, this.TrainTypeSelect, this.TimeSortSelect, this.SpecifiedTopSelect);
        },
        CarTripsBtn: function () {
            TableRemove();
            this.TableSwitch = true;
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
    let StationApi = 'http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/Station';
    axios.get(StationApi + '?$format=JSON').then(function (Response) {
        if (Response.status == 200)
        {
            App.StationOption = Response.data;
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
    let StationApi = 'http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/GeneralTimetable';
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
 * 取得支線區域資料
 */
function GetLineAreaData()
{
    let StationApi = 'https://api.taiking.tw/rail/tra/station';
    axios.get(StationApi).then(function (Response) {
        if (Response.status == 200) 
        {
            App.StartLineAreaOption = Response.data.data;
            App.EndLineAreaOption = Response.data.data;
        }
    }).catch(function (Error) {
        console.log(Error);
    });
}

/**
 * 取得支線區域車站資料
 */
function GetLineStationData()
{
    let StationApi = 'https://api.taiking.tw/rail/tra/station';
    axios.get(StationApi)
        .then(function (Response) {
            if (Response.status == 200) 
            {
                App.SpecifiedStartOption = Response.data.data;
                App.SpecifiedEndOption = Response.data.data;
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
function GetDailyTimetable(TrainNo, Dates, Top)
{
    let SelectTop = (Top == 'all') ? '?' : '?$top=' + Top;
    let StationApi = 'http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/Station';
    let URL = StationApi + '/' + TrainNo + '/' + Dates + SelectTop + '&$format=JSON';
    axios.get(URL).then(function (Response) {
        if (Response.status == 200) 
        {
            App.DailyTimeTableThead = DailyTimeTableTheadData();
            for (let Val in Response.data) 
            {
                let Data = Response.data[Val];
                Data.Direction = UseCoreApp.DirectionConvert(Data.Direction);
                Data.TripLine = UseCoreApp.TripLineConvert(Data.TripLine);
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
 * @param {string} TrainType 車種篩選
 * @param {string} Sort 排序
 * @param {number} Top 顯示筆數
 * @returns {void}
 */
function GetDailyTimetableSpecified(Start, End, Dates, TrainType, Sort, Top)
{
    let SelectTop = (Top == 'all') ? '?' : '?$top=' + Top;
    let StationApi = 'http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/';
    let URL = StationApi + 'OD/' + Start + '/to/' + End + '/' + Dates + SelectTop + '&$format=JSON';
    axios.get(URL).then(function (Response) {
        if (Response.status == 200) 
        {
            let NewData = [];
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
                Data.DailyTrainInfo.TripLine = UseCoreApp.TripLineConvert(Data.DailyTrainInfo.TripLine);
                Data.DailyTrainInfo.TrainTypeCodeName = TrainTypeConvert(Data.DailyTrainInfo.TrainTypeCode);
                Data.DailyTrainInfo.WheelchairFlag = UseCoreApp.YesNoConvert(Data.DailyTrainInfo.WheelchairFlag);
                Data.DailyTrainInfo.PackageServiceFlag = UseCoreApp.YesNoConvert(Data.DailyTrainInfo.PackageServiceFlag);
                Data.DailyTrainInfo.DiningFlag = UseCoreApp.YesNoConvert(Data.DailyTrainInfo.DiningFlag);
                Data.DailyTrainInfo.BreastFeedingFlag = UseCoreApp.YesNoConvert(Data.DailyTrainInfo.BreastFeedingFlag);
                Data.DailyTrainInfo.BikeFlag = UseCoreApp.YesNoConvert(Data.DailyTrainInfo.BikeFlag);
                Data.DailyTrainInfo.DailyFlag = UseCoreApp.YesNoConvert(Data.DailyTrainInfo.DailyFlag);
                Data.DailyTrainInfo.ServiceAddedFlag = UseCoreApp.YesNoConvert(Data.DailyTrainInfo.ServiceAddedFlag);
                if (App.TrainTypeSelect != 0)
                {
                    if(Data.DailyTrainInfo.TrainTypeCode == TrainType)
                    {
                        NewData.push(Response.data[Val]);
                    }
                }else{
                    NewData = Response.data;
                }
            }
            if (Sort == 'asc')
            {
                NewData.sort(function (I, J) {
                    return I.TimeNum > J.TimeNum
                });
            }else{
                NewData.sort(function (I, J) {
                    return I.TimeNum < J.TimeNum
                });
            }
            App.DailyTimeTableSpecifiedTbody = NewData;
        }
    }).catch(function (Error) {
        console.log(Error);
    });
}

/**
 * 取得指定車次時刻表
 * @param {string} TrainNo 車站編號
 * @returns {void}
 */
function GetCarTrips(TrainNo)
{
    let StationApi = 'http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/GeneralTimetable/';
    let URL = StationApi + 'TrainNo/' + TrainNo + '?$format=JSON';
    axios.get(URL).then(function (Response) {
        if (Response.status == 200) 
        {
            App.CarTripsThead = CarTripsTheadData();
            App.CarTripsTbody = Response.data[0].GeneralTimetable.StopTimes;
        }
    }).catch(function (Error) {
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
        { TrainDate: '時刻表日期', StationID: '車站代號', StationName: '車站名稱', TrainNo: '車次代號', Direction: '順逆行', TripLine: '山海線類型', TrainClassificationName: '車種名稱', StartingStationID: '起點車站代號', StartingStationName: '起點車站名稱', EndingStationID: '終點車站代號', EndingStationName: '終點車站名稱', ArrivalTime: '到站時間', DepartureTime: '離站時間', UpdateTime: '本平台資料更新時間'}
    ]
}

/**
 * 指定日期車次表格標題
 * @returns {Array.<Object.<string, string>>}
 */
function DailyTimeTableSpecifiedTheadData()
{
    return [
        { TrainNo: '車次代碼', OriginStopStationName: '選擇起點站名', OriginStopArrivalTime: '選擇起點到站時間', OriginStopDepartureTime: '選擇起點離站時間', DestinationStopStationName: '選擇終點站名', DestinationStopArrivalTime: '選擇終點到站時間', DestinationStopDepartureTime: '選擇終點離站時間', TimeInterval: '行車時間', Direction: '順逆行', StartingStationID: '起點車站代號', StartingStationName: '起點車站名稱', EndingStationID: '終點車站代號', EndingStationName: '終點車站名稱', TripHeadsign: '車次車頭文字描述', TrainTypeCode: '車種', TrainTypeCodeName: '車種名稱', TripLine: '山海線類型', OverNightStationID: '跨夜車站代碼', WheelchairFlag: '身障座位車', PackageServiceFlag: '行李服務', DiningFlag: '餐車服務', BikeFlag: '人車同行班次', BreastFeedingFlag: '哺(集)乳室', DailyFlag: '每日行駛', ServiceAddedFlag: '加班車', Note: '附註說明' }
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
 * 火車種類
 * @returns {Array.<Object.<string, string>>}
 */
function TrainTypeData()
{
    return [
        { Code: 0, Name: '不限' }, 
        { Code: 1, Name: '太魯閣' }, 
        { Code: 2, Name: '普悠瑪' }, 
        { Code: 3, Name: '自強' }, 
        { Code: 4, Name: '區間' }, 
        { Code: 5, Name: '復興' }, 
        { Code: 6, Name: '莒光' }, 
        { Code: 7, Name: '普快' }
    ]
}

/**
 * 路線型態轉換
 * @param {number} TrainTypeCode 
 * @returns {string}
 */
function TrainTypeConvert(TrainTypeCode)
{
    let Data = TrainTypeData();
    for (let Val in Data)
    {
        if (TrainTypeCode == Data[Val].Code)
        {
            return Data[Val].Name;
        }
    }
}

/**
 * 表格清除
 * @returns {void}
 */
function TableRemove()
{
    App.TableSwitch = false;
    App.DailyTimeTableThead = [];
    App.DailyTimeTableTbody = [];
    App.DailyTimeTableSpecifiedThead = [];
    App.DailyTimeTableSpecifiedTbody = [];
    App.CarTripsThead = [];
    App.CarTripsTbody = [];
}