package utils

import (
	"fmt"
	"io"
	"os"
	"regexp"
	"strings"
	"time"
)

// LogLevel represents the severity of a log message
type LogLevel int

const (
	// LogLevelDebug for detailed debugging information
	LogLevelDebug LogLevel = iota
	// LogLevelInfo for informational messages
	LogLevelInfo
	// LogLevelWarn for warning messages
	LogLevelWarn
	// LogLevelError for error messages
	LogLevelError
)

// Logger provides secure logging with automatic redaction of sensitive data
type Logger struct {
	level      LogLevel
	output     io.Writer
	redact     bool
	timestamps bool
}

// NewLogger creates a new secure logger
func NewLogger(level LogLevel) *Logger {
	return &Logger{
		level:      level,
		output:     os.Stderr,
		redact:     true, // Always redact by default for security
		timestamps: false,
	}
}

// SetOutput sets the output writer for the logger
func (l *Logger) SetOutput(w io.Writer) {
	l.output = w
}

// SetLevel sets the minimum log level
func (l *Logger) SetLevel(level LogLevel) {
	l.level = level
}

// EnableTimestamps enables timestamp prefixes on log messages
func (l *Logger) EnableTimestamps(enabled bool) {
	l.timestamps = enabled
}

// DisableRedaction disables automatic redaction (use with extreme caution!)
func (l *Logger) DisableRedaction(disabled bool) {
	l.redact = !disabled
}

// log is the internal logging function
func (l *Logger) log(level LogLevel, format string, args ...interface{}) {
	if level < l.level {
		return
	}

	// Format the message
	message := fmt.Sprintf(format, args...)

	// Redact sensitive information if enabled
	if l.redact {
		message = l.redactSensitiveData(message)
	}

	// Add level prefix
	var levelStr string
	switch level {
	case LogLevelDebug:
		levelStr = "[DEBUG]"
	case LogLevelInfo:
		levelStr = "[INFO]"
	case LogLevelWarn:
		levelStr = "[WARN]"
	case LogLevelError:
		levelStr = "[ERROR]"
	}

	// Add timestamp if enabled
	var timestamp string
	if l.timestamps {
		timestamp = time.Now().Format("2006-01-02 15:04:05") + " "
	}

	// Write to output
	fmt.Fprintf(l.output, "%s%s %s\n", timestamp, levelStr, message)
}

// Debug logs a debug message
func (l *Logger) Debug(format string, args ...interface{}) {
	l.log(LogLevelDebug, format, args...)
}

// Info logs an informational message
func (l *Logger) Info(format string, args ...interface{}) {
	l.log(LogLevelInfo, format, args...)
}

// Warn logs a warning message
func (l *Logger) Warn(format string, args ...interface{}) {
	l.log(LogLevelWarn, format, args...)
}

// Error logs an error message
func (l *Logger) Error(format string, args ...interface{}) {
	l.log(LogLevelError, format, args...)
}

// redactSensitiveData removes or masks sensitive information from log messages
func (l *Logger) redactSensitiveData(message string) string {
	// Define patterns for sensitive data
	patterns := []struct {
		regex       *regexp.Regexp
		replacement string
	}{
		// API keys and tokens
		{
			regexp.MustCompile(`(?i)(api[_-]?key|token|secret|password|passwd|pwd)[\s=:]+([^\s,}]+)`),
			"$1=[REDACTED]",
		},
		// Authorization headers
		{
			regexp.MustCompile(`(?i)(bearer|authorization):\s*[^\s]+`),
			"$1: [REDACTED]",
		},
		// JWT tokens
		{
			regexp.MustCompile(`eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*`),
			"[REDACTED_JWT]",
		},
		// Long hex strings (likely keys or hashes)
		{
			regexp.MustCompile(`\b[a-fA-F0-9]{32,}\b`),
			"[REDACTED_HEX]",
		},
		// Base64 encoded data (often sensitive)
		{
			regexp.MustCompile(`\b[A-Za-z0-9+/]{32,}={0,2}\b`),
			"[REDACTED_B64]",
		},
		// Database connection strings
		{
			regexp.MustCompile(`(?i)(postgres|mysql|mongodb)://[^\s]+`),
			"$1://[REDACTED]",
		},
		// URLs with credentials
		{
			regexp.MustCompile(`(https?://)[^:]+:[^@]+@`),
			"$1[REDACTED]:[REDACTED]@",
		},
		// Email addresses (for privacy)
		{
			regexp.MustCompile(`\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b`),
			"[REDACTED_EMAIL]",
		},
		// IP addresses (for privacy)
		{
			regexp.MustCompile(`\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b`),
			"[REDACTED_IP]",
		},
	}

	result := message

	// Apply regex patterns
	for _, p := range patterns {
		result = p.regex.ReplaceAllString(result, p.replacement)
	}

	// Special handling for key=value pairs
	result = l.redactEnvVars(result)

	return result
}

// redactEnvVars redacts environment variable values that look sensitive
func (l *Logger) redactEnvVars(message string) string {
	// Match KEY=value patterns
	re := regexp.MustCompile(`([A-Z_][A-Z0-9_]*)=([^\s,}]+)`)

	return re.ReplaceAllStringFunc(message, func(match string) string {
		parts := strings.SplitN(match, "=", 2)
		if len(parts) != 2 {
			return match
		}

		key := parts[0]
		value := parts[1]

		// Redact if key looks sensitive
		if IsSensitiveKey(key) {
			return key + "=[REDACTED]"
		}

		// Redact if value looks like a secret (long alphanumeric string)
		if len(value) > 16 && regexp.MustCompile(`^[a-zA-Z0-9_-]+$`).MatchString(value) {
			return key + "=[REDACTED]"
		}

		return match
	})
}

// SafeErrorString creates a safe error message for logging
// It redacts the error message while preserving the error type
func SafeErrorString(err error) string {
	if err == nil {
		return ""
	}

	message := err.Error()

	// Redact sensitive information
	logger := NewLogger(LogLevelInfo)
	return logger.redactSensitiveData(message)
}

// LogFields logs structured data safely
func (l *Logger) LogFields(level LogLevel, message string, fields map[string]interface{}) {
	// Build field string
	var fieldParts []string
	for key, value := range fields {
		valueStr := fmt.Sprintf("%v", value)

		// Redact sensitive fields
		if l.redact && (IsSensitiveKey(key) || looksLikeSensitiveValue(valueStr)) {
			valueStr = "[REDACTED]"
		}

		fieldParts = append(fieldParts, fmt.Sprintf("%s=%s", key, valueStr))
	}

	// Combine message with fields
	fullMessage := message
	if len(fieldParts) > 0 {
		fullMessage += " " + strings.Join(fieldParts, " ")
	}

	l.log(level, fullMessage)
}

// looksLikeSensitiveValue checks if a value string looks like sensitive data
func looksLikeSensitiveValue(value string) bool {
	// Long alphanumeric strings
	if len(value) > 20 && regexp.MustCompile(`^[a-zA-Z0-9+/=_-]+$`).MatchString(value) {
		return true
	}

	// Looks like a token or key
	if strings.HasPrefix(value, "sk_") || strings.HasPrefix(value, "pk_") ||
		strings.HasPrefix(value, "envt_") {
		return true
	}

	return false
}

// Global default logger
var defaultLogger = NewLogger(LogLevelInfo)

// SetDefaultLevel sets the global default log level
func SetDefaultLevel(level LogLevel) {
	defaultLogger.SetLevel(level)
}

// Debug logs a debug message using the default logger
func Debug(format string, args ...interface{}) {
	defaultLogger.Debug(format, args...)
}

// Info logs an info message using the default logger
func Info(format string, args ...interface{}) {
	defaultLogger.Info(format, args...)
}

// Warn logs a warning message using the default logger
func Warn(format string, args ...interface{}) {
	defaultLogger.Warn(format, args...)
}

// Error logs an error message using the default logger
func Error(format string, args ...interface{}) {
	defaultLogger.Error(format, args...)
}
