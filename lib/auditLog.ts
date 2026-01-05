import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const TIMEZONE = "Asia/Bangkok"; // Thailand UTC+7

function getThailandTime(): Date {
    return new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }));
}

function formatThailandTimestamp(): string {
    const now = new Date();
    return (
        now.toLocaleString("sv-SE", { timeZone: TIMEZONE }).replace(" ", "T") +
        "+07:00"
    );
}

function getThailandDate(): string {
    return getThailandTime().toISOString().split("T")[0];
}

export type AuditAction =
    // Authentication
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "LOGOUT"
    | "SIGNUP"
    | "PASSWORD_RESET_REQUEST"
    | "PASSWORD_RESET_SUCCESS"
    // File operations (User)
    | "FILE_UPLOAD"
    | "FILE_DOWNLOAD"
    | "FILE_DELETE"
    // Project operations
    | "PROJECT_CREATE"
    | "PROJECT_UPDATE"
    | "PROJECT_DELETE"
    // Admin operations
    | "ADMIN_USER_DELETE"
    | "ADMIN_USER_UPDATE"
    | "ADMIN_PROJECT_UPDATE"
    | "ADMIN_FILE_DOWNLOAD";

interface AuditLogEntry {
    timestamp: string;
    action: AuditAction;
    userId: string | null;
    userEmail?: string;
    ip?: string;
    details?: Record<string, unknown>;
}

function ensureLogDir(): void {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
}

function getLogFilePath(): string {
    const today = getThailandDate();
    return path.join(LOG_DIR, `audit-${today}.log`);
}

/**
 * Log an audit entry to file
 * @param action - The action being logged
 * @param userId - The user performing the action (null for anonymous)
 * @param options - Additional options
 */
export function logAudit(
    action: AuditAction,
    userId: string | null,
    options?: {
        userEmail?: string;
        ip?: string;
        details?: Record<string, unknown>;
    }
): void {
    try {
        ensureLogDir();

        const entry: AuditLogEntry = {
            timestamp: formatThailandTimestamp(),
            action,
            userId,
            userEmail: options?.userEmail,
            ip: options?.ip,
            details: options?.details,
        };

        const logLine = JSON.stringify(entry) + "\n";
        fs.appendFileSync(getLogFilePath(), logLine, "utf8");
    } catch (error) {
        // Silent fail - don't break the app if logging fails
        console.error("Audit log error:", error);
    }
}

/**
 * Read audit logs for a specific date
 * @param date - Date in YYYY-MM-DD format (default: today)
 * @returns Array of log entries
 */
export function readAuditLogs(date?: string): AuditLogEntry[] {
    try {
        const targetDate = date || getThailandDate();
        const logFile = path.join(LOG_DIR, `audit-${targetDate}.log`);

        if (!fs.existsSync(logFile)) {
            return [];
        }

        const content = fs.readFileSync(logFile, "utf8");
        const lines = content.trim().split("\n").filter(Boolean);

        return lines.map((line) => JSON.parse(line) as AuditLogEntry);
    } catch {
        return [];
    }
}

/**
 * Get list of available log dates
 * @returns Array of date strings (YYYY-MM-DD)
 */
export function getAvailableLogDates(): string[] {
    try {
        if (!fs.existsSync(LOG_DIR)) {
            return [];
        }

        const files = fs.readdirSync(LOG_DIR);
        return files
            .filter((f) => f.startsWith("audit-") && f.endsWith(".log"))
            .map((f) => f.replace("audit-", "").replace(".log", ""))
            .sort()
            .reverse(); // Most recent first
    } catch {
        return [];
    }
}
