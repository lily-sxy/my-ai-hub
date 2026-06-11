class CreateTasks < ActiveRecord::Migration[7.1]
  def change
    create_table :tasks, id: :string, if_not_exists: true do |t|
      t.string :title, null: false
      t.boolean :done, default: false
      t.string :date, null: false
      t.string :source_thread_id
      t.timestamps
    end
  end
end
