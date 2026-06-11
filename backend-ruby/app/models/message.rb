class Message < ApplicationRecord
  belongs_to :chat_thread, foreign_key: :thread_id
end
