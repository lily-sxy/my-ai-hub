class Thread < ApplicationRecord
  belongs_to :folder, optional: true
  has_many :messages, dependent: :destroy

  scope :active,  -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }
end
