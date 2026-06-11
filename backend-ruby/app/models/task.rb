class Task < ApplicationRecord
  belongs_to :thread, optional: true, foreign_key: :source_thread_id
end
