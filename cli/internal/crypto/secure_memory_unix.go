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

// DisableCoreDumps attempts to disable core dumps for the current process
// to prevent secrets from being written to disk in crash dumps (Unix)
func DisableCoreDumps() error {
	// Set resource limit for core dump size to 0
	var rLimit syscall.Rlimit
	rLimit.Max = 0
	rLimit.Cur = 0
	return syscall.Setrlimit(syscall.RLIMIT_CORE, &rLimit)
}
