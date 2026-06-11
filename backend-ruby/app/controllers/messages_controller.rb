require "openai"

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

    # save user message
    thread.messages.create!(role: "user", content: params[:content], id: SecureRandom.uuid)

    # update title and summary on first message
    if thread.messages.count == 1
      thread.update!(
        title: params[:content].truncate(40),
        summary: "Chat about: #{params[:content].truncate(80)}"
      )
    end

    # build message history for context
    history = thread.messages.order(:created_at).map do |m|
      { role: m.role, content: m.content }
    end

    response_text = generate_response(history, params[:model] || thread.model)

    # save assistant message
    thread.messages.create!(role: "assistant", content: response_text, id: SecureRandom.uuid)

    # stream response word by word
    self.response.headers["Content-Type"] = "text/event-stream"
    self.response.headers["Cache-Control"] = "no-cache"
    self.response_body = Enumerator.new do |y|
      response_text.split(" ").each do |word|
        y << "data: #{word} \n\n"
        sleep 0.03
      end
      y << "data: [DONE]\n\n"
    end
  end

  private

  def generate_response(history, model)
    case model
    when "gpt-4o"
      openai_response(history)
    else
      mock_response
    end
  end

  def openai_response(history)
    api_key = ENV["OPENAI_API_KEY"]
    return mock_response if api_key.blank?

    client = OpenAI::Client.new(access_token: api_key)
    response = client.chat(
      parameters: {
        model: "gpt-4o",
        messages: history,
        max_tokens: 1000,
      }
    )

    # surface API-level errors (e.g. billing, content policy)
    if response["error"]
      return "⚠️ OpenAI error: #{response.dig("error", "message")}"
    end

    response.dig("choices", 0, "message", "content") || mock_response
  rescue => e
    Rails.logger.error "OpenAI error: #{e.message}"
    "⚠️ OpenAI error: #{e.message}"
  end

  def mock_response
    MOCK_RESPONSES.sample
  end
end
