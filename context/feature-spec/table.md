# Relational Database Schema

## 1. Users

```sql
CREATE TABLE users (
  uid VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. Topics

```sql
CREATE TABLE topics (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by_user VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_topics_user
    FOREIGN KEY (created_by_user)
    REFERENCES users(uid)
    ON DELETE SET NULL
);
```

---

## 3. Vocabulary

```sql
CREATE TABLE vocabulary (
  id VARCHAR(255) PRIMARY KEY,
  topic_id VARCHAR(255) NOT NULL,
  word VARCHAR(255) NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT,
  category VARCHAR(255) NOT NULL,
  part_of_speech VARCHAR(50) NOT NULL,
  pronunciation VARCHAR(255),
  image_url TEXT,
  created_by_user VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_vocab_topic
    FOREIGN KEY (topic_id)
    REFERENCES topics(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_vocab_user
    FOREIGN KEY (created_by_user)
    REFERENCES users(uid)
    ON DELETE SET NULL,

  CONSTRAINT chk_part_of_speech
    CHECK (part_of_speech IN ('Noun', 'Verb', 'Adjective', 'Adverb', 'Phrase', 'Other'))
);
```

---

## 4. Courses

```sql
CREATE TABLE courses (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  level VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT chk_course_level
    CHECK (level IN ('Beginner', 'Intermediate', 'Advanced'))
);
```

---

## 5. Lessons

```sql
CREATE TABLE lessons (
  id VARCHAR(255) PRIMARY KEY,
  course_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  duration VARCHAR(20) NOT NULL,
  video_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_lessons_course
    FOREIGN KEY (course_id)
    REFERENCES courses(id)
    ON DELETE CASCADE
);
```

---

## 6. Lesson Progress

```sql
CREATE TABLE lesson_progress (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  lesson_id VARCHAR(255) NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_lesson_progress_user
    FOREIGN KEY (user_id)
    REFERENCES users(uid)
    ON DELETE CASCADE,

  CONSTRAINT fk_lesson_progress_lesson
    FOREIGN KEY (lesson_id)
    REFERENCES lessons(id)
    ON DELETE CASCADE,

  CONSTRAINT unique_user_lesson_progress
    UNIQUE (user_id, lesson_id)
);
```

---

## 7. Vocabulary Progress

```sql
CREATE TABLE vocabulary_progress (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  vocabulary_id VARCHAR(255) NOT NULL,
  mastered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_vocab_progress_user
    FOREIGN KEY (user_id)
    REFERENCES users(uid)
    ON DELETE CASCADE,

  CONSTRAINT fk_vocab_progress_vocabulary
    FOREIGN KEY (vocabulary_id)
    REFERENCES vocabulary(id)
    ON DELETE CASCADE,

  CONSTRAINT unique_user_vocabulary_progress
    UNIQUE (user_id, vocabulary_id)
);
```

---

# Relationship Summary

```txt
users 1 - n topics
users 1 - n vocabulary

topics 1 - n vocabulary

courses 1 - n lessons

users 1 - n lesson_progress
lessons 1 - n lesson_progress

users 1 - n vocabulary_progress
vocabulary 1 - n vocabulary_progress
```

---

# Final Tables

```txt
users
topics
vocabulary
courses
lessons
lesson_progress
vocabulary_progress
```
