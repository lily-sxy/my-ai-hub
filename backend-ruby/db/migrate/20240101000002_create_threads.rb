class CreateThreads < ActiveRecord::Migration[7.1]
  def change
    create_table :threads, id: :string, if_not_exists: true do |t|
      t.string :folder_id
      t.string :title, default: "New Chat"
      t.text :summary
      t.string :model, default: "claude"
      t.datetime :deleted_at
      t.timestamps
    end
    add_foreign_key :threads, :folders, column: :folder_id
  end
end
