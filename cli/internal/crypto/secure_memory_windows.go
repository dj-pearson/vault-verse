//go:build windows
// +build windows

package crypto

import (
	"syscall"
	"unsafe"
)

// lockMemory locks memory pages to prevent swapping to disk (Windows)
func lockMemory(b []byte) error {
	if len(b) == 0 {
		return nil
	}

	kernel32 := syscall.MustLoadDLL("kernel32.dll")
	virtualLock := kernel32.MustFindProc("VirtualLock")

	r, _, err := virtualLock.Call(
		uintptr(unsafe.Pointer(&b[0])),
		uintptr(len(b)),
	)

	if r == 0 {
		return err
	}
	return nil
}

// unlockMemory unlocks previously locked memory pages (Windows)
func unlockMemory(b []byte) error {
	if len(b) == 0 {
		return nil
	}

	kernel32 := syscall.MustLoadDLL("kernel32.dll")
	virtualUnlock := kernel32.MustFindProc("VirtualUnlock")

	r, _, err := virtualUnlock.Call(
		uintptr(unsafe.Pointer(&b[0])),
		uintptr(len(b)),
	)

	if r == 0 {
		return err
	}
	return nil
}

// DisableCoreDumps is a no-op on Windows as core dumps work differently
func DisableCoreDumps() error {
	// Windows uses Error Reporting and crash dumps differently
	// This is a no-op for Windows compatibility
	return nil
}
