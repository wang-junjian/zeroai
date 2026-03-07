import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'zeroai.db');
export const db = new Database(dbPath);

// 创建表结构
export const initDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS t_game_room (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT UNIQUE NOT NULL,
      game_status INTEGER DEFAULT 0,
      sound_enabled INTEGER DEFAULT 1,
      create_by TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_by TEXT,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (create_by) REFERENCES t_player_status(player_id)
    );

    CREATE TABLE IF NOT EXISTS t_level_map_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level_id INTEGER NOT NULL,
      map_data TEXT NOT NULL,
      create_by TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_by TEXT,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS t_player_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT NOT NULL,
      player_id TEXT NOT NULL,
      lives INTEGER DEFAULT 3,
      score INTEGER DEFAULT 0,
      tank_type TEXT,
      create_by TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_by TEXT,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_code) REFERENCES t_game_room(room_code)
    );

    CREATE TABLE IF NOT EXISTS t_tank_entity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT NOT NULL,
      tank_code TEXT NOT NULL,
      tank_type INTEGER NOT NULL,
      pos_x INTEGER NOT NULL,
      pos_y INTEGER NOT NULL,
      direction INTEGER DEFAULT 0,
      speed INTEGER DEFAULT 1,
      fire_power INTEGER DEFAULT 1,
      shield_status INTEGER DEFAULT 0,
      frozen_status INTEGER DEFAULT 0,
      is_alive INTEGER DEFAULT 1,
      create_by TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_by TEXT,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_code) REFERENCES t_game_room(room_code)
    );

    CREATE TABLE IF NOT EXISTS t_bullet_entity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT NOT NULL,
      bullet_code TEXT NOT NULL,
      owner_tank_code TEXT NOT NULL,
      pos_x INTEGER NOT NULL,
      pos_y INTEGER NOT NULL,
      direction INTEGER NOT NULL,
      bullet_type INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      create_by TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_by TEXT,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_code) REFERENCES t_game_room(room_code),
      FOREIGN KEY (owner_tank_code) REFERENCES t_tank_entity(tank_code)
    );

    CREATE TABLE IF NOT EXISTS t_map_obstacle (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT NOT NULL,
      obstacle_type INTEGER NOT NULL,
      pos_x INTEGER NOT NULL,
      pos_y INTEGER NOT NULL,
      is_destroyed INTEGER DEFAULT 0,
      create_by TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_by TEXT,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_code) REFERENCES t_game_room(room_code)
    );

    CREATE TABLE IF NOT EXISTS t_prop_entity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT NOT NULL,
      prop_code TEXT NOT NULL,
      prop_type INTEGER NOT NULL,
      pos_x INTEGER NOT NULL,
      pos_y INTEGER NOT NULL,
      is_picked INTEGER DEFAULT 0,
      create_by TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_by TEXT,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_code) REFERENCES t_game_room(room_code)
    );

    CREATE TABLE IF NOT EXISTS t_prop_effect (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT NOT NULL,
      tank_code TEXT NOT NULL,
      prop_type INTEGER NOT NULL,
      start_time DATETIME NOT NULL,
      duration_seconds INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      create_by TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_by TEXT,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_code) REFERENCES t_game_room(room_code),
      FOREIGN KEY (tank_code) REFERENCES t_tank_entity(tank_code)
    );

    CREATE TABLE IF NOT EXISTS t_level_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT NOT NULL,
      current_level_id INTEGER DEFAULT 1,
      enemy_total INTEGER DEFAULT 0,
      enemy_killed INTEGER DEFAULT 0,
      is_passed INTEGER DEFAULT 0,
      create_by TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_by TEXT,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_code) REFERENCES t_game_room(room_code)
    );

    CREATE TABLE IF NOT EXISTS t_game_settlement (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT NOT NULL,
      player_id TEXT NOT NULL,
      final_score INTEGER DEFAULT 0,
      survive_status INTEGER DEFAULT 0,
      passed_level_count INTEGER DEFAULT 0,
      result INTEGER DEFAULT 0,
      create_by TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_by TEXT,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_code) REFERENCES t_game_room(room_code),
      FOREIGN KEY (player_id) REFERENCES t_player_status(player_id)
    );

    CREATE TABLE IF NOT EXISTS t_project (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      requirements TEXT,
      current_step INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS t_project_step (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_code TEXT NOT NULL,
      step_number INTEGER NOT NULL,
      step_name TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      data TEXT,
      raw_content TEXT,
      system_prompt TEXT,
      user_prompt TEXT,
      input TEXT,
      output TEXT,
      raw_response TEXT,
      timing TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(project_code, step_number),
      FOREIGN KEY (project_code) REFERENCES t_project(code) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS t_project_version (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_code TEXT NOT NULL,
      version_number TEXT NOT NULL,
      version_name TEXT,
      is_published INTEGER DEFAULT 0,
      project_snapshot TEXT NOT NULL,
      steps_snapshot TEXT NOT NULL,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      publish_time DATETIME,
      FOREIGN KEY (project_code) REFERENCES t_project(code) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS t_project_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_code TEXT NOT NULL,
      level TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_code) REFERENCES t_project(code) ON DELETE CASCADE
    );
  `);
};

// 初始化数据库
initDatabase();
