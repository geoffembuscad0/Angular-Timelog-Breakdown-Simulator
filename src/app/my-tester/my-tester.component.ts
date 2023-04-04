import { Component, OnInit } from '@angular/core';

import * as _ from 'lodash';
import { forEach } from 'lodash';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-my-tester',
  templateUrl: './my-tester.component.html',
  styleUrls: ['./my-tester.component.scss']
})
export class MyTesterComponent implements OnInit {

  hasErrorGetAttendanceDetailsText = "";
  pendingAttendanceDetailsRequest: any;
  detailTitle: any;
  runGetLogDetailsLoader: boolean = true;
  getLogDetails: any;
  currentTimezone = "+08:00";
  detailSchedTime = "";

  constructor() { }

  ngOnInit(): void {
    // moment().tz("Asia/Shanghai").format();
    console.time('getAttendanceDetail() processing time:');

    this.getAttendanceDetail();

    console.timeEnd('getAttendanceDetail() processing time:');
  }

  getAttendanceDetail() {
    let date = "2022-04-27";
    let data = {
      dayType: "regular",
      schedTime: "8:00am - 5:00pm",
      // Morning Scenario
      schedStartTimeUTC: "2022-05-15T23:00:00+00:00",
      schedEndTimeUTC: "2022-05-16T09:00:00+00:00"

      // Graveyard Shift
      // "schedStartTimeUTC": "2022-04-27T00:00:00+00:00",
      // "schedEndTimeUTC": "2022-04-27T09:00:00+00:00"
    };

    let parent = this;

    let outputArray = new Array();

    this.detailTitle = date;
    this.runGetLogDetailsLoader = true;
    this.detailSchedTime = data.schedTime;

    parent.getLogDetails = [];

    let tzoffset = "+08:00";

    tzoffset = tzoffset == null ? parent.currentTimezone : tzoffset;

    var tzchar = tzoffset.charAt(0);

    // Ajax fetchers
    let mergedLogsDetails = new Array();
    let mergedOBsDetails = new Array();
    let fetchedTimelogs = new Array();
    let fetchedLeaves = new Array();
    let fetchedOTs = new Array();
    let fetchedOBlogs = new Array();
    let rawTimeLogsArr = new Array();
    let timeLogsPresentation = new Array();
    let OBLogsPresentation = new Array();
    let timeLogArrayPlot = new Array();

    if (tzchar == "+") {
      tzoffset = tzoffset;
    } else if (tzchar != "-") {
      tzoffset = "+" + tzoffset;
    }

    let scheduleTime = new Array();

    if (data.schedStartTimeUTC != "" && data.schedEndTimeUTC != "" && data.dayType != "rest day") {
      scheduleTime.push({ dateTime: moment(data.schedStartTimeUTC).format('YYYY-MM-DDTHH:mm:ss') + tzoffset, source: data.dayType, status: "", type: "sched" });
      scheduleTime.push({ dateTime: moment(data.schedEndTimeUTC).format('YYYY-MM-DDTHH:mm:ss') + tzoffset, source: data.dayType, status: "", type: "sched" });
    }

    // sir Edzel Sample Response
    /*let resp = {
      "timeLogs": [
        // {
        //   dateTime: "2022-07-07T15:50:00+00:00",
        //   source: "webbundly"
        // },
        // {
        //   dateTime: "2022-07-07T23:06:00+00:00",
        //   source: "webbundly"
        // }
      ],
      "leave": [
        {
          leaveEndDate: "2022-05-06T16:00:00+00:00",
          leaveStartDate: "2022-05-06T16:00:00+00:00",
          status: "Approved"
        }
      ],
      "overTime": [],
      "officialBusiness": [
        // {
        //   startDateTime: "2022-07-07T13:20:00+00:00",
        //   endDateTime: "2022-07-07T18:30:00+00:00",
        //   status: "Approved"
        // }
      ],
      "changeSchedule": []
    };*/
    let resp = {
      "timeLogs": [
          {
              "dateTime": "2022-05-16T03:10:00+00:00",
              "source": "webbundyclock"
          },
          {
              "dateTime": "2022-05-16T12:10:00+00:00",
              "source": "webbundyclock"
          }
      ],
      "leave": [],
      "overTime": [],
      "officialBusiness": [],
      "changeSchedule": []
    };
    console.log("Sir Edzel data sample", resp);
    // ---------------------------------------------------------------------------------------------------------------------------------
    fetchedTimelogs = (resp.timeLogs.length > 0) ? resp.timeLogs : [];
          fetchedOTs = (resp.overTime.length > 0) ? resp.overTime : [];

          // LEAVES
          if (resp.leave.length > 0) {
            resp.leave.forEach((leaveRawRow: any) => {
              if (moment(leaveRawRow.leaveStartDate).format('YYYY-MM-DD') == date) {
                fetchedLeaves.push({
                  date: moment(leaveRawRow.leaveStartDate).format('MMMM DD, YYYY'),
                  startTimeText: "Leave",
                  startDateTime: moment(leaveRawRow.leaveStartDate).format('YYYY-MM-DDTHH:mm:ss') + tzoffset,
                  startSource: "Leave",
                  endTimeText: "",
                  endDateTime: "",
                  endSource: "",
                  hasPreTime: false,
                  hasPostTime: false,
                  preProgressBar: 0,
                  hoursInProgressBar: 100,
                  logType: "Leave",
                  isOB: false,
                  isLate: false,
                  status: (leaveRawRow.status) ? leaveRawRow.status : ""
                });
              }
            });
            fetchedLeaves = _.sortBy(fetchedLeaves, ['startDateTime']);
          }

          console.log("scheduleTime", scheduleTime);
          // OFFICIAL BUSINESS
          if (resp.officialBusiness.length > 0) {
            let OBstartDate: any;
            let OBendDate: any;
            let OBstatus: any;
            resp.officialBusiness.forEach((OBrow: any) => {
              OBstartDate = moment(OBrow.startTime).format('YYYY-MM-DDTHH:mm:ss') + tzoffset;
              OBendDate = moment(OBrow.endTime).format('YYYY-MM-DDTHH:mm:ss') + tzoffset;
              OBstatus = OBrow.status;
            });

            let OBstartDateObj = moment(OBstartDate);
            let OBendDateObj = moment(OBendDate);
            let OBdays = OBendDateObj.diff(OBstartDateObj, 'days');

            let OBday = moment(OBstartDate);

            for (let dayOne = 0; OBdays >= dayOne; dayOne++) { // purpose: fill the days between startDate & endDate of OB
              OBday = OBday.add(dayOne, 'day');

              if (dayOne == 0) {
                fetchedOBlogs.push({
                  dateTime: moment(OBstartDate).format('YYYY-MM-DDTHH:mm:ss') + tzoffset,
                  source: "official_business",
                  status: OBstatus,
                  type: "official_business"
                });
              } else if (dayOne == OBdays) {
                fetchedOBlogs.push({
                  dateTime: moment(OBendDate).format('YYYY-MM-DDTHH:mm:ss') + tzoffset,
                  source: "official_business",
                  status: OBstatus,
                  type: "official_business"
                });
              } else {
                fetchedOBlogs.push({
                  dateTime: OBday.format('YYYY-MM-DDTHH:mm:ss') + tzoffset,
                  source: "official_business",
                  status: OBstatus,
                  type: "official_business"
                });
              }
            }
            // console.log("fetchedOBlogs", fetchedOBlogs); // okay
            // console.log("scheduleTime", scheduleTime);

            mergedOBsDetails = fetchedOBlogs;
            // mergedOBsDetails = scheduleTime.concat(mergedOBsDetails);
            mergedOBsDetails = _.sortBy(mergedOBsDetails, ['dateTime']);

            mergedOBsDetails = mergedOBsDetails.map((rawDateTime) => {
              return { dateTime: moment(rawDateTime.dateTime).format('YYYY-MM-DDTHH:mm:ss') + tzoffset, source: rawDateTime.source, status: rawDateTime.status, type: (typeof rawDateTime.type !== 'undefined') ? rawDateTime.type : "timelog" };
            });

            let OBendTime: any;
            let OBstartTime: any;
            console.log("mergedOBsDetails", mergedOBsDetails); // okay
            mergedOBsDetails.forEach((rawLogJson, rawLogIndex) => {
              OBstartTime = moment(data.schedStartTimeUTC).format('HH:mm:ss');
              OBendTime = moment(data.schedEndTimeUTC).format('HH:mm:ss');

              timeLogArrayPlot.push({
                dateTime: moment(rawLogJson.dateTime).format('YYYY-MM-DD') + 'T' + OBstartTime + tzoffset,
                source: 'official_business',
                status: (rawLogJson.status) ? rawLogJson.status : '',
                type: 'official_business'
              });

              timeLogArrayPlot.push({
                dateTime: moment(rawLogJson.dateTime).format('YYYY-MM-DD') + 'T' + OBendTime + tzoffset,
                source: 'official_business',
                status: (rawLogJson.status) ? rawLogJson.status : '',
                type: 'official_business'
              });
            });

            timeLogArrayPlot = _.sortBy(timeLogArrayPlot, ['dateTime']);
            console.log("rawTimeLogsArr", rawTimeLogsArr);// okay
            OBLogsPresentation = this.plotAttendanceDetailSummary(timeLogArrayPlot, fetchedOBlogs, date, data.schedStartTimeUTC, data.schedEndTimeUTC, tzoffset);

          }

          // console.log("fetchedOBlogs", fetchedOBlogs);
          // console.log("OBLogsPresentation", OBLogsPresentation);

          // TIMELOGS (including midnight shift)
          if (resp.timeLogs.length > 0) {
            mergedLogsDetails = fetchedTimelogs;
            mergedLogsDetails = scheduleTime.concat(mergedLogsDetails);
            mergedLogsDetails = _.sortBy(mergedLogsDetails, ['dateTime']);

            mergedLogsDetails = mergedLogsDetails.map((rawDateTime) => {
              return { dateTime: moment(rawDateTime.dateTime).format('YYYY-MM-DDTHH:mm:ss') + tzoffset, source: rawDateTime.source, status: (typeof rawDateTime.status !== 'undefined') ? rawDateTime.status : '', type: (typeof rawDateTime.type !== 'undefined') ? rawDateTime.type : "timelog" };
            }); console.log("mergedLogsDetails", mergedLogsDetails);

            let GYelevenFiftyNine: any;
            let GYtwelveMidnight: any;

            mergedLogsDetails.forEach((rawLogJson, rawLogIndex) => {

              switch (rawLogIndex) {
                case 0:
                  timeLogArrayPlot.push(rawLogJson);
                  break;
                default:
                  if (moment(rawLogJson.dateTime).isAfter(mergedLogsDetails[rawLogIndex - 1].dateTime, 'day')) { // IF Previous dateTime isBefore(current DateTime)
                    GYelevenFiftyNine = moment(mergedLogsDetails[rawLogIndex - 1].dateTime).format('YYYY-MM-DD') + 'T23:59:00' + tzoffset;
                    GYtwelveMidnight = moment(mergedLogsDetails[rawLogIndex].dateTime).format('YYYY-MM-DD') + 'T00:00:00' + tzoffset;

                    timeLogArrayPlot.push({
                      dateTime: GYelevenFiftyNine,
                      source: 'next day',
                      status: (rawLogJson.status) ? rawLogJson.status : '',
                      type: ''
                    });

                    timeLogArrayPlot.push({
                      dateTime: GYtwelveMidnight,
                      source: 'yesterday',
                      status: (rawLogJson.status) ? rawLogJson.status : '',
                      type: ''
                    });

                    timeLogArrayPlot.push(rawLogJson);

                  } else {
                    timeLogArrayPlot.push(rawLogJson);
                  }
              }
            });

            timeLogArrayPlot = _.sortBy(timeLogArrayPlot, ['dateTime']);
            console.log("timeLogArrayPlot", timeLogArrayPlot);
            rawTimeLogsArr = timeLogArrayPlot.reduce((a, i) => a.concat(i, i), []);
            rawTimeLogsArr = _.dropRight(_.tail(rawTimeLogsArr));

            timeLogsPresentation = this.plotAttendanceDetailSummary(rawTimeLogsArr, fetchedTimelogs, date, data.schedStartTimeUTC, data.schedEndTimeUTC, tzoffset);

          } else if (resp.timeLogs.length == 0 && resp.officialBusiness.length == 0 && resp.leave.length == 0 && resp.overTime.length == 0) {

            let presentationLog = {
              date: moment(date).format('MMMM DD, YYYY'),
              startTimeText: "Absent",
              startDateTime: "",
              startSource: "Absent",
              endTimeText: "",
              endDateTime: "",
              endSource: "",
              logId: "",
              hasPreTime: false,
              hasPostTime: false,
              preProgressBar: 25,
              hoursInProgressBar: 45,
              logType: "absent",
              isOB: false,
              isLate: false,
              status: "",
            };

            timeLogsPresentation.push(presentationLog);
          }

          timeLogsPresentation = timeLogsPresentation.concat(fetchedLeaves);

          timeLogsPresentation = timeLogsPresentation.concat(OBLogsPresentation);

          outputArray = timeLogsPresentation;

          console.log("Final Array Output", outputArray);
          // sessionStorage.setItem("EmployeeDTR:" + JSON.stringify(paramsGetAttendanceDetails), JSON.stringify(timeLogsPresentation));

          parent.getLogDetails = outputArray;
  }

  plotAttendanceDetailSummary(timeLogArrayPlot, fetchedOBlogs, date, schedStartTimeUTC, schedEndTimeUTC, tzoffset = "+00:00") {
    let compPreProgressBarTime :any;
    let compStartTime: any;
    let compEndTime: any;
    let timeDiffPreShadeProgressBar: any;
    let timeDifference: any;
    let diffPreProgressBar = 0;
    let diffInHours = 0;
    let hoursInPreProgressBar = 0;
    let hoursInProgressBar = 0;
    let LogsPresentation = new Array();

    let rawTimeLogsArr = _.chunk(timeLogArrayPlot, 2);

    rawTimeLogsArr.forEach((rowLogArr: any, rowLogIndex) => {
      let startProgressBarTime = moment(date).format("YYYY-MM-DD") + "T00:00:00" + tzoffset;

      let presentationLog = {
        date: "",
        startTimeText: "",
        startDateTime: "",
        startSource: "",
        endTimeText: "",
        endDateTime: "",
        endSource: "",
        logId: "",
        hasPreTime: false,
        hasPostTime: false,
        preProgressBar: 0,
        hoursInProgressBar: 0,
        logType: "",
        isOB: true,
        isLate: false,
        status: (rowLogArr.status) ? rowLogArr.status : "",
      };

      rowLogArr.forEach((colLogArr: any, colLogIndex) => {
        // fetchedTimelogs.length > 0
        // startTimeText: "Absent",
        // console.log("colLogArr", colLogArr);
        switch (colLogIndex) {
          case 0:
            startProgressBarTime = (moment(date).format("YYYY-MM-DD") == moment(colLogArr.dateTime).format("YYYY-MM-DD")) ? moment(date).format("YYYY-MM-DD") + "T00:00:00" + tzoffset : moment(colLogArr.dateTime).format("YYYY-MM-DD") + "T00:00:00" + tzoffset;
            presentationLog.startDateTime = colLogArr.dateTime;
            presentationLog.startSource = (fetchedOBlogs.length > 0) ? colLogArr.source : "";
            presentationLog.startTimeText = moment(colLogArr.dateTime).format('hh:mm A');
            break;
          default:
            presentationLog.endDateTime = colLogArr.dateTime;
            presentationLog.endSource = (fetchedOBlogs.length > 0) ? colLogArr.source : "";
            presentationLog.endTimeText = (fetchedOBlogs.length > 0) ? moment(colLogArr.dateTime).format('hh:mm A') : "";
            presentationLog.status = (presentationLog.startTimeText == "Leave" || presentationLog.startTimeText == "Overtime") ? colLogArr.status : "";
            break;
        }

        presentationLog.startSource = (fetchedOBlogs.length > 0) ? presentationLog.startSource : this.detailSchedTime;
        presentationLog.logType = "Regular";
      });

      presentationLog.date = moment(presentationLog.startDateTime).format('MMMM DD, YYYY');

      presentationLog.isOB = (presentationLog.startSource == 'official_business' || presentationLog.endSource == 'official_business') ? true : false;

      presentationLog.isLate = (rowLogIndex == 0 && (presentationLog.startSource == 'regular' && presentationLog.endSource != 'regular')) ? true : false;

      // Progress Bar
      compPreProgressBarTime = moment(startProgressBarTime);
      compStartTime = moment(presentationLog.startDateTime);
      compEndTime = moment(presentationLog.endDateTime);

      timeDiffPreShadeProgressBar = moment.duration(compStartTime.diff(compPreProgressBarTime));
      timeDifference = moment.duration(compEndTime.diff(compStartTime));

      diffPreProgressBar = timeDiffPreShadeProgressBar.asHours();
      diffInHours = timeDifference.asHours();

      hoursInPreProgressBar = diffPreProgressBar * 4.16;
      hoursInProgressBar = diffInHours * 4.16;

      presentationLog.preProgressBar = hoursInPreProgressBar;
      presentationLog.hoursInProgressBar = hoursInProgressBar;

      presentationLog.hasPreTime = compStartTime.isBefore(schedStartTimeUTC);
      presentationLog.hasPostTime = compEndTime.isAfter(schedEndTimeUTC);

      hoursInProgressBar > 0.00 && LogsPresentation.push(presentationLog); // only pushed if starttime & endtime are not the same values

    });

    LogsPresentation = LogsPresentation.filter((obj) => {
      return moment(obj.startDateTime).format('hh:mm A') != '11:59 PM' && moment(obj.endDateTime).format('hh:mm A') != '12:00 AM';
    });

    LogsPresentation = _.orderBy(LogsPresentation, ['startDateTime']);
    console.log("LogsPresentation", LogsPresentation);

    return LogsPresentation;
  }
}
