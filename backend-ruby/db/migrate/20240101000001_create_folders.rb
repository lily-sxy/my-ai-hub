class CreateFolders < ActiveRecord::Migration[7.1]
  def change
    create_table :folders, id: :string, if_not_exists: true do |t|
      t.string :name, null: false
      t.integer :position, default: 0
      t.timestamps
    end
  end
end
