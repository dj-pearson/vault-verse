package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"io"

	"github.com/zalando/go-keyring"
	"golang.org/x/crypto/pbkdf2"
)

const (
	KeyringService = "envault"
	MasterKeyName  = "master-key"
	KeySize        = 32 // 256 bits
	NonceSize      = 12 // 96 bits for GCM
	SaltSize       = 32
	Iterations     = 100000
)

// Service handles all cryptographic operations
type Service struct {
	masterKey *SecureBytes
}

// New creates a new crypto service instance
func New() (*Service, error) {
	key, err := getMasterKey()
	if err != nil {
		return nil, fmt.Errorf("failed to get master key: %w", err)
	}

	// Wrap master key in SecureBytes for automatic wiping
	secureKey := FromBytes(key)

	// Lock the master key in memory to prevent swapping
	if err := secureKey.Lock(); err != nil {
		// Log warning but don't fail - this is best-effort
		// Some systems may not support memory locking
	}

	// Wipe the original key slice
	WipeBytes(key)

	return &Service{
		masterKey: secureKey,
	}, nil
}

// Close securely wipes the master key from memory
func (s *Service) Close() {
	if s.masterKey != nil {
		s.masterKey.Wipe()
	}
}

// getMasterKey retrieves or generates the master encryption key
func getMasterKey() ([]byte, error) {
	// Try to get existing key from OS keychain
	keyStr, err := keyring.Get(KeyringService, MasterKeyName)
	if err == nil {
		// Key exists, decode and return
		key, err := base64.StdEncoding.DecodeString(keyStr)
		if err != nil {
			return nil, fmt.Errorf("failed to decode master key: %w", err)
		}
		return key, nil
	}

	// Key doesn't exist, generate new one
	key := make([]byte, KeySize)
	if _, err := io.ReadFull(rand.Reader, key); err != nil {
		return nil, fmt.Errorf("failed to generate master key: %w", err)
	}

	// Store in OS keychain
	keyStr = base64.StdEncoding.EncodeToString(key)
	if err := keyring.Set(KeyringService, MasterKeyName, keyStr); err != nil {
		return nil, fmt.Errorf("failed to store master key: %w", err)
	}

	return key, nil
}

// Encrypt encrypts plaintext using AES-256-GCM
func (s *Service) Encrypt(plaintext string) ([]byte, error) {
	if plaintext == "" {
		return nil, fmt.Errorf("plaintext cannot be empty")
	}

	// Create secure bytes for plaintext to ensure it's wiped after use
	plaintextBytes := FromString(plaintext)
	defer plaintextBytes.Wipe()

	block, err := aes.NewCipher(s.masterKey.Bytes())
	if err != nil {
		return nil, fmt.Errorf("failed to create cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM: %w", err)
	}

	// Generate random nonce
	nonce := make([]byte, NonceSize)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, fmt.Errorf("failed to generate nonce: %w", err)
	}

	// Encrypt and authenticate
	ciphertext := gcm.Seal(nonce, nonce, plaintextBytes.Bytes(), nil)
	return ciphertext, nil
}

// Decrypt decrypts ciphertext using AES-256-GCM
func (s *Service) Decrypt(ciphertext []byte) (string, error) {
	if len(ciphertext) < NonceSize {
		return "", fmt.Errorf("ciphertext too short")
	}

	block, err := aes.NewCipher(s.masterKey.Bytes())
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	// Extract nonce
	nonce := ciphertext[:NonceSize]
	ciphertext = ciphertext[NonceSize:]

	// Decrypt and verify
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", fmt.Errorf("decryption failed: %w", err)
	}

	// Create secure bytes for plaintext that will be auto-wiped
	// Note: The caller is responsible for wiping the returned string
	result := string(plaintext)

	// Wipe the plaintext bytes immediately after conversion
	WipeBytes(plaintext)

	return result, nil
}

// DecryptToSecureBytes decrypts ciphertext and returns SecureBytes for automatic wiping
func (s *Service) DecryptToSecureBytes(ciphertext []byte) (*SecureBytes, error) {
	plaintext, err := s.Decrypt(ciphertext)
	if err != nil {
		return nil, err
	}

	// Create SecureBytes from the decrypted string
	secureBytes := FromString(plaintext)

	// Try to wipe the original string (best effort)
	WipeString(&plaintext)

	return secureBytes, nil
}

// DeriveKey derives a key from a password using PBKDF2
func DeriveKey(password, salt []byte) []byte {
	return pbkdf2.Key(password, salt, Iterations, KeySize, sha256.New)
}

// GenerateSalt generates a random salt for key derivation
func GenerateSalt() ([]byte, error) {
	salt := make([]byte, SaltSize)
	if _, err := io.ReadFull(rand.Reader, salt); err != nil {
		return nil, fmt.Errorf("failed to generate salt: %w", err)
	}
	return salt, nil
}

// Hash creates a SHA-256 hash of the input
func Hash(input string) string {
	hash := sha256.Sum256([]byte(input))
	return fmt.Sprintf("%x", hash)
}

// DeleteMasterKey removes the master key from the OS keychain
// WARNING: This will make all encrypted data unrecoverable!
func DeleteMasterKey() error {
	return keyring.Delete(KeyringService, MasterKeyName)
}
