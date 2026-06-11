class MessagesController < ApplicationController
  MOCK_RESPONSES = [
    "That's a great question! Let me break this down step by step.\n\nFirst, consider the core problem you're trying to solve. Then we can work through the best approach together.",
    "I'd be happy to help with that!\n\nHere's my suggestion: start simple, then iterate. Don't over-engineer — focus on what matters most right now.",
    "Interesting! There are a few ways to approach this.\n\n**Option 1:** Quick and simple — gets you moving fast.\n**Option 2:** More robust — takes longer but scales better.\n\nFor a personal project, I'd go with Option 1 first.",
    "Sure! Let me think through this with you.\n\nThe key thing to keep in mind: done is better than perfect. Start with a working version, then polish as you go.",
  ]

  def index
    thread = ChatThread.find(params[:thread_id])
    render json: thread.messages.order(:created_at)
  end

  def create
    thread = ChatThread.find(params[:thread_id])

    thread.messages.create!(role: "user", content: params[:content], id: SecureRandom.uuid)

    if thread.messages.count == 1
      thread.update!(
        title: params[:content].truncate(40),
        summary: "Chat about: #{params[:content].truncate(80)}"
      )
    end

    response_text = MOCK_RESPONSES.sample
    thread.messages.create!(role: "assistant", content: response_text, id: SecureRandom.uuid)

    self.response.headers["Content-Type"] = "text/event-stream"
    self.response.headers["Cache-Control"] = "no-cache"
    self.response_body = Enumerator.new do |y|
      response_text.split(" ").each do |word|
        y << "data: #{word} \n\n"
        sleep 0.05
      end
      y << "data: [DONE]\n\n"
    end
  end
end
