class Folder < ApplicationRecord
  has_many :chat_threads, foreign_key: :folder_id, dependent: :nullify, class_name: "ChatThread"
end
