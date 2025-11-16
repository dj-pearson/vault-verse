package storage

import "fmt"

// DeleteEnvironment deletes an environment and all its secrets
func (db *DB) DeleteEnvironment(id string) error {
	query := `DELETE FROM environments WHERE id = ?`
	result, err := db.conn.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete environment: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("environment not found")
	}

	return nil
}
