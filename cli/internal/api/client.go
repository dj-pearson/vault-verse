package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	DefaultBaseURL = "https://your-project.supabase.co"
	DefaultTimeout = 30 * time.Second
)

// Client represents an API client for EnvVault backend
type Client struct {
	baseURL    string
	httpClient *http.Client
	apiKey     string
	authToken  string
}

// New creates a new API client
func New(baseURL, apiKey string) *Client {
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}

	return &Client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: DefaultTimeout,
		},
		apiKey: apiKey,
	}
}

// SetAuthToken sets the authentication token for API requests
func (c *Client) SetAuthToken(token string) {
	c.authToken = token
}

// ValidateToken validates a CLI token with the backend
func (c *Client) ValidateToken(token string) (string, error) {
	payload := map[string]interface{}{
		"p_token": token,
	}

	var result struct {
		UserID string `json:"user_id"`
	}

	if err := c.rpcCall("validate_cli_token", payload, &result); err != nil {
		return "", err
	}

	return result.UserID, nil
}

// PushEncryptedBlob pushes an encrypted blob to the backend
func (c *Client) PushEncryptedBlob(projectID, encryptedData, checksum string) (*PushBlobResponse, error) {
	payload := map[string]interface{}{
		"p_project_id":     projectID,
		"p_encrypted_data": encryptedData,
		"p_checksum":       checksum,
	}

	var result PushBlobResponse
	if err := c.rpcCall("push_encrypted_blob", payload, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

// PullEncryptedBlob pulls the latest encrypted blob from the backend
func (c *Client) PullEncryptedBlob(projectID string, sinceVersion *int) (*PullBlobResponse, error) {
	payload := map[string]interface{}{
		"p_project_id": projectID,
	}
	if sinceVersion != nil {
		payload["p_since_version"] = *sinceVersion
	}

	var result PullBlobResponse
	if err := c.rpcCall("pull_encrypted_blob", payload, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

// GetProjects retrieves all projects for the authenticated user
func (c *Client) GetProjects() ([]Project, error) {
	req, err := c.newRequest("GET", "/rest/v1/projects", nil)
	if err != nil {
		return nil, err
	}

	var projects []Project
	if err := c.do(req, &projects); err != nil {
		return nil, err
	}

	return projects, nil
}

// GetEnvironments retrieves all environments for a project
func (c *Client) GetEnvironments(projectID string) ([]Environment, error) {
	url := fmt.Sprintf("/rest/v1/environments?project_id=eq.%s", projectID)
	req, err := c.newRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	var environments []Environment
	if err := c.do(req, &environments); err != nil {
		return nil, err
	}

	return environments, nil
}

// InviteTeamMember invites a team member to a project
func (c *Client) InviteTeamMember(projectID, email, role string) (string, error) {
	payload := map[string]interface{}{
		"p_project_id": projectID,
		"p_email":      email,
		"p_role":       role,
	}

	var memberID string
	if err := c.rpcCall("invite_team_member", payload, &memberID); err != nil {
		return "", err
	}

	return memberID, nil
}

// RemoveTeamMember removes a team member from a project
func (c *Client) RemoveTeamMember(projectID, userID string) (bool, error) {
	payload := map[string]interface{}{
		"p_project_id": projectID,
		"p_user_id":    userID,
	}

	var success bool
	if err := c.rpcCall("remove_team_member", payload, &success); err != nil {
		return false, err
	}

	return success, nil
}

// ListTeamMembers retrieves all team members for a project
func (c *Client) ListTeamMembers(projectID string) ([]TeamMember, error) {
	payload := map[string]interface{}{
		"p_project_id": projectID,
	}

	var members []TeamMember
	if err := c.rpcCall("list_team_members", payload, &members); err != nil {
		return nil, err
	}

	return members, nil
}

// GetUserByEmail retrieves a user ID by email address
func (c *Client) GetUserByEmail(email string) (string, error) {
	payload := map[string]interface{}{
		"p_email": email,
	}

	var userID string
	if err := c.rpcCall("get_user_by_email", payload, &userID); err != nil {
		return "", err
	}

	return userID, nil
}

// rpcCall makes an RPC function call to Supabase
func (c *Client) rpcCall(functionName string, payload map[string]interface{}, result interface{}) error {
	url := fmt.Sprintf("/rest/v1/rpc/%s", functionName)
	req, err := c.newRequest("POST", url, payload)
	if err != nil {
		return err
	}

	return c.do(req, result)
}

// newRequest creates a new HTTP request
func (c *Client) newRequest(method, path string, body interface{}) (*http.Request, error) {
	url := c.baseURL + path

	var bodyReader io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		bodyReader = bytes.NewBuffer(jsonBody)
	}

	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", c.apiKey)

	if c.authToken != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.authToken))
	}

	return req, nil
}

// do executes an HTTP request and decodes the response
func (c *Client) do(req *http.Request, result interface{}) error {
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	// Check for HTTP errors
	if resp.StatusCode >= 400 {
		return fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(bodyBytes))
	}

	// Decode response
	if result != nil {
		if err := json.Unmarshal(bodyBytes, result); err != nil {
			return fmt.Errorf("failed to decode response: %w", err)
		}
	}

	return nil
}

// Response types
type PushBlobResponse struct {
	ID         string    `json:"id"`
	Version    int       `json:"version"`
	UploadedAt time.Time `json:"uploaded_at"`
}

type PullBlobResponse struct {
	HasUpdate     bool      `json:"has_update"`
	ID            string    `json:"id,omitempty"`
	Version       int       `json:"version,omitempty"`
	EncryptedData string    `json:"encrypted_data,omitempty"`
	Checksum      string    `json:"checksum,omitempty"`
	UploadedAt    time.Time `json:"uploaded_at,omitempty"`
}

type Project struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	OwnerID     string    `json:"owner_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Environment struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"project_id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type TeamMember struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UserID    string    `json:"user_id"`
}
