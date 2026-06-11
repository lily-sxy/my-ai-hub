class CreateMessages < ActiveRecord::Migration[7.1]
  def change
    create_table :messages, id: :string, if_not_exists: true do |t|
      t.string :thread_id, null: false
      t.string :role, null: false
      t.text :content, null: false
      t.timestamps
    end
    add_foreign_key :messages, :threads
  end
end
