-- Flyway migration V001: Create table for AI scribe sessions
-- This table tracks AI-generated encounter note sessions

CREATE TABLE IF NOT EXISTS ai_scribe_session (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    demographic_no INT NOT NULL,
    provider_no VARCHAR(6) NOT NULL,
    encounter_id INT,
    status ENUM('recording','transcribing','generating','review','finalized','cancelled') DEFAULT 'recording',
    audio_filename VARCHAR(255),
    transcript TEXT,
    generated_note TEXT,
    soap_subjective TEXT,
    soap_objective TEXT,
    soap_assessment TEXT,
    soap_plan TEXT,
    ai_model VARCHAR(100),
    confidence_score DECIMAL(3,2),
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finalized_at DATETIME,
    INDEX idx_demographic (demographic_no),
    INDEX idx_provider (provider_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
