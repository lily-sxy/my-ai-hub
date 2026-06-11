class Folder < ApplicationRecord
  has_many :threads, foreign_key: :folder_id, dependent: :nullify
end
