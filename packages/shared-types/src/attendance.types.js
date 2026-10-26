"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckOutLabel = exports.CheckInLabel = exports.WorkStatus = void 0;
var WorkStatus;
(function (WorkStatus) {
    WorkStatus["AT_OFFICE"] = "AT_OFFICE";
    WorkStatus["REMOTE"] = "REMOTE";
    WorkStatus["ON_DUTY"] = "ON_DUTY";
    WorkStatus["ON_LEAVE"] = "ON_LEAVE";
    WorkStatus["SICK_LEAVE"] = "SICK_LEAVE";
    WorkStatus["ABSENT"] = "ABSENT";
    WorkStatus["NOT_CHECKED_IN"] = "NOT_CHECKED_IN";
})(WorkStatus || (exports.WorkStatus = WorkStatus = {}));
var CheckInLabel;
(function (CheckInLabel) {
    CheckInLabel["ON_TIME"] = "ON_TIME";
    CheckInLabel["LATE"] = "LATE";
})(CheckInLabel || (exports.CheckInLabel = CheckInLabel = {}));
var CheckOutLabel;
(function (CheckOutLabel) {
    CheckOutLabel["NORMAL"] = "NORMAL";
    CheckOutLabel["EARLY"] = "EARLY";
    CheckOutLabel["MISSING"] = "MISSING";
})(CheckOutLabel || (exports.CheckOutLabel = CheckOutLabel = {}));
//# sourceMappingURL=attendance.types.js.map