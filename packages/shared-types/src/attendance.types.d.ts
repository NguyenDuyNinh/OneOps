export declare enum WorkStatus {
    AT_OFFICE = "AT_OFFICE",
    REMOTE = "REMOTE",
    ON_DUTY = "ON_DUTY",
    ON_LEAVE = "ON_LEAVE",
    SICK_LEAVE = "SICK_LEAVE",
    ABSENT = "ABSENT",
    NOT_CHECKED_IN = "NOT_CHECKED_IN"
}
export declare enum CheckInLabel {
    ON_TIME = "ON_TIME",
    LATE = "LATE"
}
export declare enum CheckOutLabel {
    NORMAL = "NORMAL",
    EARLY = "EARLY",
    MISSING = "MISSING"
}
export interface AttendanceRecord {
    id: string;
    userId: string;
    status: WorkStatus;
    checkedInAt: Date;
    checkedOutAt?: Date;
    checkInLabel?: CheckInLabel;
    checkOutLabel?: CheckOutLabel;
    note?: string;
    workLocation?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface HeadcountSummary {
    total: number;
    atOffice: number;
    remote: number;
    onDuty: number;
    onLeave: number;
    absent: number;
    notCheckedIn: number;
    updatedAt: Date;
}
export interface HeadcountEmployee {
    userId: string;
    name: string;
    avatarUrl?: string;
    status: WorkStatus;
    checkedInAt?: Date;
    note?: string;
}
export interface CheckInDto {
    type: WorkStatus;
    note?: string;
    workLocation?: string;
}
export interface UpdateWorkStatusDto {
    status: WorkStatus;
    note?: string;
    workLocation?: string;
}
