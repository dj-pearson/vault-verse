//go:build !linux && !darwin && !freebsd && !openbsd && !netbsd && !windows
// +build !linux,!darwin,!freebsd,!openbsd,!netbsd,!windows

package crypto

// lockMemory is a no-op on unsupported platforms
func lockMemory(b []byte) error {
	// Memory locking not supported on this platform
	return nil
}

// unlockMemory is a no-op on unsupported platforms
func unlockMemory(b []byte) error {
	// Memory unlocking not supported on this platform
	return nil
}

// DisableCoreDumps is a no-op on unsupported platforms
func DisableCoreDumps() error {
	// Core dump disabling not supported on this platform
	return nil
}
