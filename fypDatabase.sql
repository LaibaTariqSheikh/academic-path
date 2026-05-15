CREATE DATABASE ai_academic_path;
USE ai_academic_path;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'guide', 'admin') NOT NULL,
  institute VARCHAR(100),
  city VARCHAR(100),
  grade VARCHAR(50),
  institute_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questionnaire1_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,

  academic_performance VARCHAR(50),
  math_level VARCHAR(50),
  science_level VARCHAR(50),
  english_level VARCHAR(50),
  interest_type VARCHAR(100),
  study_consistency VARCHAR(50),
  problem_solving VARCHAR(50),
  focus_time VARCHAR(50),
  learning_style VARCHAR(50),
  english_comfort VARCHAR(50),
  computer_usage VARCHAR(50),
  financial_status VARCHAR(50),

  predicted_stream VARCHAR(50),
  predicted_system VARCHAR(50),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE questionnaire2_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,

  previous_system VARCHAR(50),
  previous_stream VARCHAR(50),
  academic_performance VARCHAR(50),
  strong_subject VARCHAR(50),
  weak_area VARCHAR(50),
  interest_area VARCHAR(50),
  study_independence VARCHAR(50),
  study_hours VARCHAR(50),
  analytical_skill VARCHAR(50),
  problem_handling VARCHAR(50),
  tuition_access VARCHAR(50),
  study_preference VARCHAR(50),
  career_clarity VARCHAR(50),
  decision_factor VARCHAR(50),
  confidence_level VARCHAR(50),

  predicted_stream VARCHAR(50),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_q1_user ON questionnaire1_responses(user_id);
CREATE INDEX idx_q2_user ON questionnaire2_responses(user_id);