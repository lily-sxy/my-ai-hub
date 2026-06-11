class ChatThread < ApplicationRecord
  self.table_name = "threads"

  belongs_to :folder, optional: true
  has_many :messages, foreign_key: :thread_id, dependent: :destroy

  scope :active,  -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }
end
