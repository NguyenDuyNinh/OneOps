"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalStatus = exports.ProposalType = exports.TaskDeadlineStatus = exports.TaskStatus = void 0;
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "TODO";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["REVIEW"] = "REVIEW";
    TaskStatus["REWORK"] = "REWORK";
    TaskStatus["DONE"] = "DONE";
    TaskStatus["PAUSED"] = "PAUSED";
    TaskStatus["CANCELLED"] = "CANCELLED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskDeadlineStatus;
(function (TaskDeadlineStatus) {
    TaskDeadlineStatus["NORMAL"] = "NORMAL";
    TaskDeadlineStatus["WARNING"] = "WARNING";
    TaskDeadlineStatus["OVERDUE"] = "OVERDUE";
})(TaskDeadlineStatus || (exports.TaskDeadlineStatus = TaskDeadlineStatus = {}));
var ProposalType;
(function (ProposalType) {
    ProposalType["PAUSE"] = "PAUSE";
    ProposalType["CANCEL"] = "CANCEL";
    ProposalType["CHANGE_DEADLINE"] = "CHANGE_DEADLINE";
})(ProposalType || (exports.ProposalType = ProposalType = {}));
var ProposalStatus;
(function (ProposalStatus) {
    ProposalStatus["PENDING"] = "PENDING";
    ProposalStatus["APPROVED"] = "APPROVED";
    ProposalStatus["REJECTED"] = "REJECTED";
})(ProposalStatus || (exports.ProposalStatus = ProposalStatus = {}));
//# sourceMappingURL=task.types.js.map