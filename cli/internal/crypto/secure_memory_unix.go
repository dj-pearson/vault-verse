//go:build linux || darwin || freebsd || openbsd || netbsd
// +build linux darwin freebsd openbsd netbsd

package crypto

import "syscall"

// lockMemory locks memory pages to prevent swapping to disk (Unix)
func lockMemory(b []byte) error {
	if len(b) == 0 {
		return nil
	}
	return syscall.Mlock(b)
}

// unlockMemory unlocks previously locked memory pages (Unix)
func unlockMemory(b []byte) error {
	if len(b) == 0 {
		return nil
	}
	return syscall.Munlock(b)
}
