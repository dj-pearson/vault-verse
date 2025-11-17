package crypto

import (
	"crypto/rand"
	"runtime"
)

// SecureBytes represents a byte slice that will be securely wiped from memory
// when no longer needed. It prevents sensitive data from lingering in memory.
type SecureBytes struct {
	data   []byte
	wiped  bool
	locked bool
}

// NewSecureBytes creates a new SecureBytes with the given capacity
func NewSecureBytes(capacity int) *SecureBytes {
	sb := &SecureBytes{
		data:  make([]byte, capacity),
		wiped: false,
	}
	// Set finalizer to ensure cleanup even if Wipe() isn't called
	runtime.SetFinalizer(sb, func(s *SecureBytes) {
		s.Wipe()
	})
	return sb
}

// FromBytes creates a SecureBytes from existing data (copies the data)
func FromBytes(data []byte) *SecureBytes {
	sb := NewSecureBytes(len(data))
	copy(sb.data, data)
	return sb
}

// FromString creates a SecureBytes from a string (copies the data)
func FromString(s string) *SecureBytes {
	return FromBytes([]byte(s))
}

// Bytes returns the underlying byte slice. USE WITH CAUTION.
// The returned slice should not be stored or used after Wipe() is called.
func (sb *SecureBytes) Bytes() []byte {
	if sb.wiped {
		return nil
	}
	return sb.data
}

// String returns the data as a string. The returned string will be
// invalid after Wipe() is called.
func (sb *SecureBytes) String() string {
	if sb.wiped {
		return ""
	}
	return string(sb.data)
}

// Len returns the length of the secure bytes
func (sb *SecureBytes) Len() int {
	if sb.wiped {
		return 0
	}
	return len(sb.data)
}

// Wipe securely erases the data from memory
func (sb *SecureBytes) Wipe() {
	if sb.wiped {
		return
	}

	// Unlock memory if it was locked
	if sb.locked {
		sb.Unlock()
	}

	// Overwrite with zeros
	for i := range sb.data {
		sb.data[i] = 0
	}

	// Overwrite with random data
	rand.Read(sb.data)

	// Final zero pass
	for i := range sb.data {
		sb.data[i] = 0
	}

	sb.wiped = true

	// Prevent compiler optimization from removing the above operations
	runtime.KeepAlive(sb.data)
}

// Lock attempts to lock the memory pages to prevent swapping to disk
// This is a best-effort operation and may fail without error on some systems
func (sb *SecureBytes) Lock() error {
	if len(sb.data) == 0 {
		return nil
	}

	// Try to lock the memory (mlock on Unix, VirtualLock on Windows)
	err := lockMemory(sb.data)
	if err == nil {
		sb.locked = true
	}
	return err
}

// Unlock unlocks previously locked memory
func (sb *SecureBytes) Unlock() error {
	if !sb.locked {
		return nil
	}

	err := unlockMemory(sb.data)
	if err == nil {
		sb.locked = false
	}
	return err
}

// SecureString is a wrapper around SecureBytes for string data
type SecureString struct {
	*SecureBytes
}

// NewSecureString creates a new SecureString
func NewSecureString(s string) *SecureString {
	return &SecureString{
		SecureBytes: FromString(s),
	}
}

// Platform-specific memory locking functions are implemented in:
// - secure_memory_unix.go (Linux, macOS, BSD)
// - secure_memory_windows.go (Windows)
// - secure_memory_other.go (fallback for other platforms)

// Helper function to securely wipe a byte slice
func WipeBytes(b []byte) {
	if len(b) == 0 {
		return
	}

	// Triple-pass wipe
	for i := range b {
		b[i] = 0
	}

	rand.Read(b)

	for i := range b {
		b[i] = 0
	}

	runtime.KeepAlive(b)
}

// Helper function to securely wipe a string's underlying bytes
// Note: This only works if you have exclusive access to the string's backing array
func WipeString(s *string) {
	if s == nil || len(*s) == 0 {
		return
	}

	// Convert string to byte slice (this is unsafe but necessary for wiping)
	bytes := []byte(*s)
	WipeBytes(bytes)
	*s = ""
	runtime.KeepAlive(bytes)
}

// SecureRandom generates cryptographically secure random bytes
func SecureRandom(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	if err != nil {
		return nil, err
	}
	return b, nil
}

// ConstantTimeCompare performs a constant-time comparison of two byte slices
// to prevent timing attacks
func ConstantTimeCompare(a, b []byte) bool {
	if len(a) != len(b) {
		return false
	}

	var result byte = 0
	for i := 0; i < len(a); i++ {
		result |= a[i] ^ b[i]
	}

	return result == 0
}
