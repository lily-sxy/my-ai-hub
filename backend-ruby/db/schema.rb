# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2024_01_01_000004) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "folders", id: :string, force: :cascade do |t|
    t.string "name", null: false
    t.integer "position"
    t.timestamptz "created_at", default: -> { "now()" }
  end

  create_table "messages", id: :string, force: :cascade do |t|
    t.string "thread_id", null: false
    t.string "role", null: false
    t.text "content", null: false
    t.timestamptz "created_at", default: -> { "now()" }
  end

  create_table "tasks", id: :string, force: :cascade do |t|
    t.string "title", null: false
    t.boolean "done"
    t.string "date", null: false
    t.string "source_thread_id"
    t.timestamptz "created_at", default: -> { "now()" }
  end

  create_table "threads", id: :string, force: :cascade do |t|
    t.string "folder_id"
    t.string "title"
    t.text "summary"
    t.string "model"
    t.timestamptz "deleted_at"
    t.timestamptz "created_at", default: -> { "now()" }
  end

  add_foreign_key "messages", "threads"
  add_foreign_key "messages", "threads", name: "messages_thread_id_fkey"
  add_foreign_key "tasks", "threads", column: "source_thread_id", name: "tasks_source_thread_id_fkey"
  add_foreign_key "threads", "folders"
  add_foreign_key "threads", "folders", name: "threads_folder_id_fkey"
end
